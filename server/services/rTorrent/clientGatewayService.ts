import fs from 'node:fs';
import path from 'node:path';

import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  ReannounceTorrentsOptions,
  SetTorrentsTagsOptions,
} from '@shared/schema/api/torrents';
import type {RTorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import type {SetClientSettingsOptions} from '@shared/types/api/client';
import type {
  CheckTorrentsOptions,
  DeleteTorrentsOptions,
  MoveTorrentsOptions,
  SetTorrentContentsPropertiesOptions,
  SetTorrentsInitialSeedingOptions,
  SetTorrentsPriorityOptions,
  SetTorrentsSequentialOptions,
  SetTorrentsTrackersOptions,
  StartTorrentsOptions,
  StopTorrentsOptions,
} from '@shared/types/api/torrents';
import type {ClientSettings} from '@shared/types/ClientSettings';
import type {TorrentList, TorrentListSummary, TorrentProperties} from '@shared/types/Torrent';
import type {TorrentContent} from '@shared/types/TorrentContent';
import type {TorrentPeer} from '@shared/types/TorrentPeer';
import type {TorrentTracker} from '@shared/types/TorrentTracker';
import type {TransferSummary} from '@shared/types/TransferData';
import {move} from 'fs-extra';
import sanitize from 'sanitize-filename';

import {fetchUrls} from '../../util/fetchUtil';
import {isAllowedPath, sanitizePath} from '../../util/fileUtil';
import {getComment, setCompleted, setTrackers} from '../../util/torrentFileUtil';
import ClientGatewayService from '../clientGatewayService';
import * as geoip from '../geoip';
import ClientRequestManager from './clientRequestManager';
import {
  clientSettingMethodCallConfigs,
  torrentContentMethodCallConfigs,
  torrentListMethodCallConfigs,
  torrentPeerMethodCallConfigs,
  torrentTrackerMethodCallConfigs,
  transferSummaryMethodCallConfigs,
} from './constants/methodCallConfigs';
import type {RPCError} from './types/RPCError';
import type {MultiMethodCalls} from './util/rTorrentMethodCallUtil';
import {getMethodCalls, processMethodCallResponse} from './util/rTorrentMethodCallUtil';
import {
  encodeTags,
  getAddTorrentPropertiesCalls,
  getTorrentETAFromProperties,
  getTorrentPercentCompleteFromProperties,
  getTorrentStatusFromProperties,
} from './util/torrentPropertiesUtil';

class RTorrentClientGatewayService extends ClientGatewayService {
  clientRequestManager = new ClientRequestManager(this.user.client as RTorrentConnectionSettings);
  availableMethodCalls = this.fetchAvailableMethodCalls(true);

  async appendTorrentCommentCall(file: string, additionalCalls: string[]) {
    const comment = await getComment(Buffer.from(file, 'base64'));
    if (comment && comment.length > 0) {
      // VRS24mrker is used for compatability with ruTorrent
      return [...additionalCalls, `d.custom2.set="VRS24mrker${encodeURIComponent(comment)}"`];
    }
    return additionalCalls;
  }

  async addTorrentsByFile({
    files,
    destination,
    tags,
    isBasePath,
    isCompleted,
    isSequential,
    isInitialSeeding,
    start,
  }: Required<AddTorrentByFileOptions>): Promise<string[]> {
    await fs.promises.mkdir(destination, {recursive: true});

    let processedFiles: string[] = files;
    if (isCompleted) {
      processedFiles = (
        await Promise.all(
          files.map(async (file) => {
            return (await setCompleted(Buffer.from(file, 'base64'), destination, isBasePath))?.toString('base64');
          }),
        )
      ).filter((file) => file) as string[];
    }

    if (!processedFiles[0]) {
      throw new Error();
    }

    const additionalCalls = getAddTorrentPropertiesCalls({
      destination,
      isBasePath,
      isSequential,
      isInitialSeeding,
      tags,
    });

    const result: string[] = [];

    if (this.clientRequestManager.isJSONCapable) {
      await this.clientRequestManager
        .methodCall('system.multicall', [
          await Promise.all(
            processedFiles.map(async (file) => ({
              methodName: start ? 'load.start_throw' : 'load.throw',
              params: [
                '',
                `data:applications/x-bittorrent;base64,${file}`,
                ...(await this.appendTorrentCommentCall(file, additionalCalls)),
              ],
            })),
          ),
        ])
        .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
        .then((response: Array<Array<string | number>>) => {
          const hashes = response.flat(2).filter((value) => typeof value === 'string') as string[];
          result.push(...hashes);
        });
    } else {
      await Promise.all(
        processedFiles.map(async (file) => {
          await this.clientRequestManager
            .methodCall(start ? 'load.raw_start' : 'load.raw', [
              '',
              Buffer.from(file, 'base64'),
              ...(await this.appendTorrentCommentCall(file, additionalCalls)),
            ])
            .then(this.processClientRequestSuccess, this.processRTorrentRequestError);
        }),
      );
    }

    return result;
  }

  async addTorrentsByURL({
    urls: inputUrls,
    cookies,
    destination,
    tags,
    isBasePath,
    isCompleted,
    isSequential,
    isInitialSeeding,
    start,
  }: Required<AddTorrentByURLOptions>): Promise<string[]> {
    await fs.promises.mkdir(destination, {recursive: true});

    const {files, urls} = await fetchUrls(inputUrls, cookies);

    if (!files[0] && !urls[0]) {
      throw new Error();
    }

    const result: string[] = [];

    if (urls[0]) {
      let methodName: string;
      if (this.clientRequestManager.isJSONCapable) {
        methodName = start ? 'load.start_throw' : 'load.throw';
      } else {
        methodName = start ? 'load.start' : 'load.normal';
      }

      await this.clientRequestManager
        .methodCall('system.multicall', [
          urls.map((url) => ({
            methodName,
            params: [
              '',
              url,
              ...getAddTorrentPropertiesCalls({destination, isBasePath, isSequential, isInitialSeeding, tags}),
            ],
          })),
        ])
        .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
        .then((response: Array<Array<string | number>>) => {
          const hashes = response.flat(2).filter((value) => typeof value === 'string') as string[];
          result.push(...hashes);
        });
    }

    if (files[0]) {
      await this.addTorrentsByFile({
        files: files.map((file) => file.toString('base64')) as [string, ...string[]],
        destination,
        tags,
        isBasePath,
        isCompleted,
        isSequential,
        isInitialSeeding,
        start,
      }).then((hashes) => {
        result.push(...hashes);
      });
    }

    return result;
  }

  async checkTorrents({hashes}: CheckTorrentsOptions): Promise<void> {
    const methodCalls = hashes.reduce((accumulator: MultiMethodCalls, hash) => {
      accumulator.push({
        methodName: 'd.check_hash',
        params: [hash],
      });

      return accumulator;
    }, []);

    return this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then(() => {
        // returns nothing.
      });
  }

  async getTorrentContents(hash: TorrentProperties['hash']): Promise<Array<TorrentContent>> {
    return this.clientRequestManager
      .methodCall('f.multicall', [hash, ''].concat((await this.availableMethodCalls).torrentContent))
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then((responses: string[][]) => {
        return Promise.all(
          responses.map((response) => processMethodCallResponse(response, torrentContentMethodCallConfigs)),
        );
      })
      .then((processedResponses) => {
        return processedResponses.map((content, index) => {
          return {
            index,
            path: content.path,
            filename: content.path.split('/').pop() || '',
            percentComplete: (content.completedChunks / content.sizeChunks) * 100,
            priority: content.priority,
            sizeBytes: content.sizeBytes,
          };
        });
      });
  }

  async getTorrentPeers(hash: TorrentProperties['hash']): Promise<Array<TorrentPeer>> {
    return this.clientRequestManager
      .methodCall('p.multicall', [hash, ''].concat((await this.availableMethodCalls).torrentPeer))
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then((responses: string[][]) => {
        return Promise.all(
          responses.map((response) => processMethodCallResponse(response, torrentPeerMethodCallConfigs)),
        );
      })
      .then((processedResponses) => {
        return Promise.all(
          processedResponses.map(async (processedResponse) => {
            return {
              ...processedResponse,
              country: geoip.lookup(processedResponse.address),
            };
          }),
        );
      });
  }

  async getTorrentTrackers(hash: TorrentProperties['hash']): Promise<Array<TorrentTracker>> {
    return this.clientRequestManager
      .methodCall('t.multicall', [hash, ''].concat((await this.availableMethodCalls).torrentTracker))
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then((responses: string[][]) => {
        return Promise.all(
          responses.map((response) => processMethodCallResponse(response, torrentTrackerMethodCallConfigs)),
        );
      })
      .then((processedResponses) =>
        processedResponses
          .filter((processedResponse) => processedResponse.isEnabled)
          .map((processedResponse) => {
            return {
              url: processedResponse.url,
              type: processedResponse.type,
            };
          }),
      );
  }

  async moveTorrents({hashes, destination, moveFiles, isBasePath, isCheckHash}: MoveTorrentsOptions): Promise<void> {
    await this.stopTorrents({hashes});

    await fs.promises.mkdir(destination, {recursive: true});

    if (moveFiles) {
      const isMultiFile = await this.clientRequestManager
        .methodCall('system.multicall', [
          hashes.map((hash) => {
            return {
              methodName: 'd.is_multi_file',
              params: [hash],
            };
          }),
        ])
        .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
        .then((responses: string[][]): boolean[] =>
          responses.map((response) => (typeof response === 'number' ? response !== 0 : response?.[0] !== '0')),
        )
        .catch(() => undefined);

      if (isMultiFile == null || isMultiFile.length !== hashes.length) {
        throw new Error();
      }

      await Promise.all(
        hashes.map(async (hash, index) => {
          const {directory, name} = this.services?.torrentService.getTorrent(hash) || {};

          if (directory == null || name == null) {
            return;
          }

          const sourceDirectory = path.resolve(directory);
          const destDirectory = isMultiFile[index]
            ? path.resolve(isBasePath ? destination : path.join(destination, name))
            : path.resolve(destination);

          if (sourceDirectory !== destDirectory) {
            if (isMultiFile[index]) {
              await move(sourceDirectory, destDirectory, {overwrite: true});
            } else {
              await move(path.join(sourceDirectory, name), path.join(destDirectory, name), {overwrite: true});
            }
          }
        }),
      );
    }

    const hashesToRestart: Array<string> = [];
    const methodCalls = hashes.reduce((accumulator: MultiMethodCalls, hash) => {
      accumulator.push({
        methodName: isBasePath ? 'd.directory_base.set' : 'd.directory.set',
        params: [hash, destination],
      });

      if (!this.services?.torrentService.getTorrent(hash).status.includes('stopped')) {
        hashesToRestart.push(hash);
      }

      return accumulator;
    }, []);

    await this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError);

    if (isCheckHash) {
      await this.checkTorrents({hashes});
    }

    return this.startTorrents({hashes: hashesToRestart});
  }

  async reannounceTorrents({hashes}: ReannounceTorrentsOptions): Promise<void> {
    const methodCalls = hashes.map((hash) => ({
      methodName: 'd.tracker_announce',
      params: [hash],
    }));

    return this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then(() => {
        // returns nothing.
      });
  }

  async removeTorrents({hashes, deleteData}: DeleteTorrentsOptions): Promise<void> {
    // Stop torrents
    await this.stopTorrents({hashes});

    // Fetch paths of contents of torrents
    const directoryPaths = new Set<string>();
    const contentPaths = new Set<string>();

    if (deleteData) {
      await Promise.all(
        hashes.map((hash) => {
          const {directory} = this.services?.torrentService.getTorrent(hash) || {};

          if (directory == null) {
            throw new Error();
          }

          return this.getTorrentContents(hash).then((contents) => {
            if (contents.length > 1) {
              contents.map((content) => {
                const relativePathSegments = path.normalize(content.path).split(path.sep);

                // Remove last segment (filename)
                relativePathSegments.pop();

                while (relativePathSegments.length) {
                  directoryPaths.add(path.resolve(directory, ...relativePathSegments));
                  relativePathSegments.pop();
                }
              });

              directoryPaths.add(path.resolve(directory));
            }

            contents
              .map((content) => sanitizePath(path.resolve(directory, content.path)))
              .filter((contentPath) => fs.existsSync(contentPath))
              .filter((contentPath) => isAllowedPath(contentPath))
              .forEach((contentPath) => contentPaths.add(contentPath));
          });
        }),
      );
    }

    // Remove torrents from rTorrent session
    await this.clientRequestManager
      .methodCall('system.multicall', [
        hashes.map((hash) => ({
          methodName: 'd.erase',
          params: [hash],
        })),
      ])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError);

    // Delete contents of torrents
    for await (const contentPath of contentPaths) {
      await fs.promises.unlink(contentPath).catch(() => undefined);
    }

    // Try to remove empty directories
    for await (const directoryPath of directoryPaths) {
      await fs.promises.rmdir(directoryPath).catch(() => undefined);
    }
  }

  async setTorrentsInitialSeeding({hashes, isInitialSeeding}: SetTorrentsInitialSeedingOptions): Promise<void> {
    const hashesToRestart: Array<string> = hashes.filter(
      (hash) => !this.services?.torrentService.getTorrent(hash).status.includes('stopped'),
    );

    await this.stopTorrents({hashes});

    await this.clientRequestManager
      .methodCall('system.multicall', [
        hashes.map((hash) => ({
          methodName: 'd.connection_seed.set',
          params: [hash, isInitialSeeding ? 'initial_seed' : 'seed'],
        })),
      ])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then(() => {
        // returns nothing.
      });

    await this.startTorrents({hashes: hashesToRestart});
  }

  async setTorrentsPriority({hashes, priority}: SetTorrentsPriorityOptions): Promise<void> {
    const methodCalls = hashes.reduce((accumulator: MultiMethodCalls, hash) => {
      accumulator.push({
        methodName: 'd.priority.set',
        params: [hash, `${priority}`],
      });

      accumulator.push({
        methodName: 'd.update_priorities',
        params: [hash],
      });

      return accumulator;
    }, []);

    return this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then(() => {
        // returns nothing.
      });
  }

  async setTorrentsSequential({hashes, isSequential}: SetTorrentsSequentialOptions): Promise<void> {
    const methodCalls: MultiMethodCalls = hashes.map((hash) => ({
      methodName: 'd.down.sequential.set',
      params: [hash, isSequential ? '1' : '0'],
    }));

    return this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then(() => {
        // returns nothing.
      });
  }

  async setTorrentsTags({hashes, tags}: SetTorrentsTagsOptions): Promise<void> {
    const methodCalls = hashes.reduce((accumulator: MultiMethodCalls, hash) => {
      accumulator.push({
        methodName: 'd.custom1.set',
        params: [hash, encodeTags(tags)],
      });

      return accumulator;
    }, []);

    return this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then(() => {
        // returns nothing.
      });
  }

  async setTorrentsTrackers({hashes, trackers}: SetTorrentsTrackersOptions): Promise<void> {
    const methodCalls = hashes.reduce((accumulator: MultiMethodCalls, hash) => {
      // Disable existing trackers
      accumulator.push({
        methodName: 't.multicall',
        params: [hash, '', 't.disable='],
      });

      // Insert new trackers
      trackers.forEach((tracker) => {
        accumulator.push({
          methodName: 'd.tracker.insert',
          params: [hash, '0', tracker],
        });
      });

      // Save full session to apply tracker change
      accumulator.push({
        methodName: 'd.save_full_session',
        params: [hash],
      });

      return accumulator;
    }, []);

    await this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError);

    const {path: sessionDirectory, case: torrentCase} = await this.getClientSessionDirectory();

    await Promise.all(
      [...new Set(hashes)].map(async (hash) =>
        setTrackers(
          path.join(
            sessionDirectory,
            sanitize(`${torrentCase === 'lower' ? hash.toLowerCase() : hash.toUpperCase()}.torrent`),
          ),
          trackers,
        ),
      ),
    );
  }

  async setTorrentContentsPriority(
    hash: string,
    {indices, priority}: SetTorrentContentsPropertiesOptions,
  ): Promise<void> {
    const methodCalls = indices.reduce((accumulator: MultiMethodCalls, index) => {
      accumulator.push({
        methodName: 'f.priority.set',
        params: [`${hash}:f${index}`, `${priority}`],
      });

      return accumulator;
    }, []);

    methodCalls.push({
      methodName: 'd.update_priorities',
      params: [hash],
    });

    return this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then(() => {
        // returns nothing.
      });
  }

  async startTorrents({hashes}: StartTorrentsOptions): Promise<void> {
    const methodCalls = hashes.reduce((accumulator: MultiMethodCalls, hash) => {
      accumulator.push({
        methodName: 'd.open',
        params: [hash],
      });

      accumulator.push({
        methodName: 'd.start',
        params: [hash],
      });

      return accumulator;
    }, []);

    return this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then(() => {
        // returns nothing.
      });
  }

  async stopTorrents({hashes}: StopTorrentsOptions): Promise<void> {
    const methodCalls = hashes.reduce((accumulator: MultiMethodCalls, hash) => {
      accumulator.push({
        methodName: 'd.stop',
        params: [hash],
      });

      accumulator.push({
        methodName: 'd.close',
        params: [hash],
      });

      return accumulator;
    }, []);

    return this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then(() => {
        // returns nothing.
      });
  }

  async fetchTorrentList(): Promise<TorrentListSummary> {
    return this.clientRequestManager
      .methodCall('d.multicall2', ['', 'main'].concat((await this.availableMethodCalls).torrentList))
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then((responses: string[][]) => {
        this.emit('PROCESS_TORRENT_LIST_START');
        return Promise.all(
          responses.map((response) => processMethodCallResponse(response, torrentListMethodCallConfigs)),
        );
      })
      .then(async (processedResponses) => {
        const torrentList: TorrentList = Object.assign(
          {},
          ...(await Promise.all(
            processedResponses.map(async (response) => {
              const torrentProperties: TorrentProperties = {
                bytesDone: response.bytesDone,
                comment: response.comment,
                dateActive: response.downRate > 0 || response.upRate > 0 ? -1 : response.dateActive,
                dateAdded: response.dateAdded,
                dateCreated: response.dateCreated,
                dateFinished: response.dateFinished,
                directory: response.directory,
                downRate: response.downRate,
                downTotal: response.downTotal,
                eta: getTorrentETAFromProperties(response),
                hash: response.hash,
                isPrivate: response.isPrivate,
                isInitialSeeding: response.isInitialSeeding,
                isSequential: response.isSequential,
                message: response.message,
                name: response.name,
                peersConnected: response.peersConnected,
                peersTotal: response.peersTotal,
                percentComplete: getTorrentPercentCompleteFromProperties(response),
                priority: response.priority,
                ratio: response.ratio,
                seedsConnected: response.seedsConnected,
                seedsTotal: response.seedsTotal,
                sizeBytes: response.sizeBytes,
                status: getTorrentStatusFromProperties(response),
                tags: response.tags,
                trackerURIs: response.trackerURIs,
                upRate: response.upRate,
                upTotal: response.upTotal,
              };

              this.emit('PROCESS_TORRENT', torrentProperties);

              return {
                [response.hash]: torrentProperties,
              };
            }),
          )),
        );

        const torrentListSummary = {
          id: Date.now(),
          torrents: torrentList,
        };

        this.emit('PROCESS_TORRENT_LIST_END', torrentListSummary);
        return torrentListSummary;
      });
  }

  async fetchTransferSummary(): Promise<TransferSummary> {
    const methodCalls: MultiMethodCalls = (await this.availableMethodCalls).transferSummary.map((methodCall) => {
      return {
        methodName: methodCall,
        params: [''],
      };
    });

    return this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then((response) => {
        return processMethodCallResponse(response, transferSummaryMethodCallConfigs);
      });
  }

  async getClientSessionDirectory(): Promise<{path: string; case: 'lower' | 'upper'}> {
    return this.clientRequestManager
      .methodCall('session.path', [''])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then((response) => ({path: response, case: 'upper'}));
  }

  async getClientSettings(): Promise<ClientSettings> {
    const methodCalls: MultiMethodCalls = (await this.availableMethodCalls).clientSetting.map((methodCall) => {
      return {
        methodName: methodCall,
        params: [''],
      };
    });

    return this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then((response) => {
        return processMethodCallResponse(response, clientSettingMethodCallConfigs);
      });
  }

  async setClientSettings(settings: SetClientSettingsOptions): Promise<void> {
    const configs = clientSettingMethodCallConfigs;
    const methodCalls = Object.keys(settings).reduce((accumulator: MultiMethodCalls, key) => {
      const property = key as keyof SetClientSettingsOptions;
      let methodName = '';
      let param = settings[property];

      if (param == null) {
        return accumulator;
      }

      switch (property) {
        case 'dht':
          methodName = 'dht.mode.set';
          param = (param as ClientSettings[typeof property]) ? 'auto' : 'disable';
          break;
        case 'piecesMemoryMax':
          methodName = `${configs[property].methodCall}.set`;
          param = (param as ClientSettings[typeof property]) * 1024 * 1024;
          break;
        default:
          methodName = `${configs[property].methodCall}.set`;
          break;
      }

      if (typeof param === 'boolean') {
        param = param ? '1' : '0';
      }

      accumulator.push({
        methodName,
        params: ['', `${param}`],
      });

      return accumulator;
    }, []);

    return this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then(() => {
        // returns nothing.
      });
  }

  async testGateway(): Promise<void> {
    const availableMethodCalls = await this.fetchAvailableMethodCalls();
    this.availableMethodCalls = Promise.resolve(availableMethodCalls);
  }

  async fetchAvailableMethodCalls(fallback = false): Promise<{
    clientSetting: string[];
    torrentContent: string[];
    torrentList: string[];
    torrentPeer: string[];
    torrentTracker: string[];
    transferSummary: string[];
  }> {
    let methodList: Array<string> = [];
    const listMethods = () => {
      return this.clientRequestManager
        .methodCall('system.listMethods', [])
        .then(this.processClientRequestSuccess, this.processRTorrentRequestError);
    };

    this.clientRequestManager.isJSONCapable = true;
    methodList = await listMethods().catch((e: RPCError) => {
      if (e.isRPCError || e.name == 'SyntaxError') {
        this.clientRequestManager.isJSONCapable = false;
      } else if (!fallback) {
        throw e;
      }
    });

    if (!this.clientRequestManager.isJSONCapable) {
      methodList = await listMethods().catch((e) => {
        if (!fallback) {
          throw e;
        }
      });
    }

    const getAvailableMethodCalls =
      methodList?.length > 0
        ? (methodCalls: Array<string>) => {
            return methodCalls.map((method) => (methodList.includes(method.split('=')[0]) ? method : 'false='));
          }
        : (methodCalls: Array<string>) => methodCalls;

    return {
      clientSetting: getAvailableMethodCalls(getMethodCalls(clientSettingMethodCallConfigs)),
      torrentContent: getAvailableMethodCalls(getMethodCalls(torrentContentMethodCallConfigs)),
      torrentList: getAvailableMethodCalls(getMethodCalls(torrentListMethodCallConfigs)),
      torrentPeer: getAvailableMethodCalls(getMethodCalls(torrentPeerMethodCallConfigs)),
      torrentTracker: getAvailableMethodCalls(getMethodCalls(torrentTrackerMethodCallConfigs)),
      transferSummary: getAvailableMethodCalls(getMethodCalls(transferSummaryMethodCallConfigs)),
    };
  }

  processRTorrentRequestError = (error: RPCError) => {
    if (!error?.isRPCError) {
      return this.processClientRequestError(error);
    }

    throw error;
  };
}

export default RTorrentClientGatewayService;
