import fs from 'fs';
import geoip from 'geoip-country';
import {moveSync} from 'fs-extra';
import path from 'path';
import sanitize from 'sanitize-filename';

import type {ClientSettings} from '@shared/types/ClientSettings';
import type {RTorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import type {TorrentContent} from '@shared/types/TorrentContent';
import type {TorrentList, TorrentListSummary, TorrentProperties} from '@shared/types/Torrent';
import type {TorrentPeer} from '@shared/types/TorrentPeer';
import type {TorrentTracker} from '@shared/types/TorrentTracker';
import type {TransferSummary} from '@shared/types/TransferData';
import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  CheckTorrentsOptions,
  DeleteTorrentsOptions,
  MoveTorrentsOptions,
  SetTorrentContentsPropertiesOptions,
  SetTorrentsPriorityOptions,
  SetTorrentsTagsOptions,
  SetTorrentsTrackersOptions,
  StartTorrentsOptions,
  StopTorrentsOptions,
} from '@shared/types/api/torrents';
import type {SetClientSettingsOptions} from '@shared/types/api/client';

import {createDirectory} from '../../util/fileUtil';
import ClientGatewayService from '../interfaces/clientGatewayService';
import ClientRequestManager from './clientRequestManager';
import {getMethodCalls, processMethodCallResponse} from './util/rTorrentMethodCallUtil';
import {fetchURLToTempFile, saveBufferToTempFile} from '../../util/tempFileUtil';
import {setCompleted, setTrackers} from '../../util/torrentFileUtil';
import {
  encodeTags,
  getTorrentETAFromProperties,
  getTorrentPercentCompleteFromProperties,
  getTorrentStatusFromProperties,
} from './util/torrentPropertiesUtil';
import {
  clientSettingMethodCallConfigs,
  torrentContentMethodCallConfigs,
  torrentListMethodCallConfigs,
  torrentPeerMethodCallConfigs,
  torrentTrackerMethodCallConfigs,
  transferSummaryMethodCallConfigs,
} from './constants/methodCallConfigs';

import type {MultiMethodCalls} from './util/rTorrentMethodCallUtil';

const filePathMethodCalls = getMethodCalls({pathComponents: torrentContentMethodCallConfigs.pathComponents});

class RTorrentClientGatewayService extends ClientGatewayService {
  clientRequestManager = new ClientRequestManager(this.user.client as RTorrentConnectionSettings);

  async addTorrentsByFile({
    files,
    destination,
    tags,
    isBasePath,
    isCompleted,
    start,
  }: AddTorrentByFileOptions): Promise<void> {
    if (!Array.isArray(files)) {
      return Promise.reject();
    }

    const torrentPaths = await Promise.all(
      files.map(async (file) => {
        return saveBufferToTempFile(Buffer.from(file, 'base64'), 'torrent');
      }),
    );

    return this.addTorrentsByURL({urls: torrentPaths, destination, tags, isBasePath, isCompleted, start});
  }

  async addTorrentsByURL({
    urls,
    cookies,
    destination,
    tags,
    isBasePath,
    isCompleted,
    start,
  }: AddTorrentByURLOptions): Promise<void> {
    await createDirectory(destination);

    const torrentPaths: Array<string> = (
      await Promise.all(
        urls.map(async (url) => {
          if (/^(http|https):\/\//.test(url)) {
            const domain = url.split('/')[2];

            // TODO: properly handle error and let frontend know
            const torrentPath = await fetchURLToTempFile(
              url,
              cookies ? cookies[domain] : undefined,
              'torrent',
            ).catch((e) => console.error(e));

            if (typeof torrentPath === 'string') {
              return torrentPath;
            }

            return '';
          }

          // TODO: handle potential other types of downloads

          return url;
        }),
      )
    ).filter((torrentPath) => torrentPath !== '');

    if (isCompleted) {
      await Promise.all(
        torrentPaths.map((torrentPath) => {
          if (!fs.existsSync(torrentPath)) {
            return false;
          }

          return setCompleted(torrentPath, destination, isBasePath);
        }),
      );
    }

    const methodCalls: MultiMethodCalls = torrentPaths.map((torrentPath) => {
      const additionalCalls: Array<string> = [];

      additionalCalls.push(`${isBasePath ? 'd.directory_base.set' : 'd.directory.set'}="${destination}"`);

      if (Array.isArray(tags)) {
        additionalCalls.push(`d.custom1.set=${encodeTags(tags)}`);
      }

      additionalCalls.push(`d.custom.set=addtime,${Math.round(Date.now() / 1000)}`);

      return {
        methodName: start ? 'load.start' : 'load.normal',
        params: ['', torrentPath].concat(additionalCalls),
      };
    }, []);

    return (
      this.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then(() => {
          // returns nothing.
        }) || Promise.reject()
    );
  }

  async checkTorrents({hashes}: CheckTorrentsOptions): Promise<void> {
    const methodCalls = hashes.reduce((accumulator: MultiMethodCalls, hash) => {
      accumulator.push({
        methodName: 'd.check_hash',
        params: [hash],
      });

      return accumulator;
    }, []);

    return (
      this.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then(() => {
          // returns nothing.
        }) || Promise.reject()
    );
  }

  async getTorrentContents(hash: TorrentProperties['hash']): Promise<Array<TorrentContent>> {
    const configs = torrentContentMethodCallConfigs;
    return (
      this.clientRequestManager
        .methodCall('f.multicall', [hash, ''].concat(getMethodCalls(configs)))
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then((responses: string[][]) => {
          return Promise.all(responses.map((response) => processMethodCallResponse(response, configs)));
        })
        .then((processedResponses) => {
          return processedResponses.map((content, index) => {
            return {
              index,
              path: content.path,
              filename: content.path.split('/').pop() || '',
              percentComplete: Math.trunc((content.completedChunks / content.sizeChunks) * 100),
              priority: content.priority,
              sizeBytes: content.sizeBytes,
            };
          });
        }) || Promise.reject()
    );
  }

  async getTorrentPeers(hash: TorrentProperties['hash']): Promise<Array<TorrentPeer>> {
    const configs = torrentPeerMethodCallConfigs;
    return (
      this.clientRequestManager
        .methodCall('p.multicall', [hash, ''].concat(getMethodCalls(configs)))
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then((responses: string[][]) => {
          return Promise.all(responses.map((response) => processMethodCallResponse(response, configs)));
        })
        .then((processedResponses) => {
          return Promise.all(
            processedResponses.map(async (processedResponse) => {
              return {
                ...processedResponse,
                country: geoip.lookup(processedResponse.address)?.country || '',
              };
            }),
          );
        }) || Promise.reject()
    );
  }

  async getTorrentTrackers(hash: TorrentProperties['hash']): Promise<Array<TorrentTracker>> {
    const configs = torrentTrackerMethodCallConfigs;
    return (
      this.clientRequestManager
        .methodCall('t.multicall', [hash, ''].concat(getMethodCalls(configs)))
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then((responses: string[][]) => {
          return Promise.all(responses.map((response) => processMethodCallResponse(response, configs)));
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
        ) || Promise.reject()
    );
  }

  async moveTorrents({hashes, destination, moveFiles, isBasePath, isCheckHash}: MoveTorrentsOptions): Promise<void> {
    try {
      await this.stopTorrents({hashes});
    } catch (e) {
      return Promise.reject(e);
    }

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
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then((responses: string[][]) => {
          return responses.map((response) => {
            const [value] = response;
            return value === '1';
          });
        })
        .catch(() => undefined);

      if (isMultiFile == null || isMultiFile.length !== hashes.length) {
        return Promise.reject();
      }

      hashes.forEach((hash, index) => {
        const {directory, name} = this.services?.torrentService.getTorrent(hash) || {};

        if (directory == null || name == null) {
          return;
        }

        const sourceDirectory = path.resolve(directory);
        const destDirectory = isMultiFile[index]
          ? path.resolve(isBasePath ? destination : path.join(destination, name))
          : path.resolve(destination);

        if (sourceDirectory !== destDirectory) {
          try {
            if (isMultiFile[index]) {
              moveSync(sourceDirectory, destDirectory, {overwrite: true});
            } else {
              moveSync(path.join(sourceDirectory, name), path.join(destDirectory, name), {overwrite: true});
            }
          } catch (err) {
            console.error(`Failed to move files to ${destDirectory}.`);
            console.error(err);
          }
        }
      });
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

    try {
      await this.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError);
    } catch (e) {
      return Promise.reject(e);
    }

    if (isCheckHash) {
      try {
        await this.checkTorrents({hashes});
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return this.startTorrents({hashes: hashesToRestart});
  }

  async removeTorrents({hashes, deleteData}: DeleteTorrentsOptions): Promise<void> {
    const methodCalls = hashes.reduce((accumulator: MultiMethodCalls, hash, index) => {
      let eraseFileMethodCallIndex = index;

      // If we're deleting files, we grab each torrents' file list before we remove them.
      if (deleteData === true) {
        // We offset the indices of these method calls so that we know exactly
        // where to retrieve the responses in the future.
        const directoryBaseMethodCallIndex = index + hashes.length;
        // We also need to ensure that the erase method call occurs after
        // our request for information.
        eraseFileMethodCallIndex = index + hashes.length * 2;

        accumulator[index] = {
          methodName: 'f.multicall',
          params: [hash, ''].concat(filePathMethodCalls),
        };

        accumulator[directoryBaseMethodCallIndex] = {
          methodName: 'd.directory_base',
          params: [hash],
        };
      }

      accumulator[eraseFileMethodCallIndex] = {
        methodName: 'd.erase',
        params: [hash],
      };

      return accumulator;
    }, []);

    return (
      this.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then((response) => {
          if (deleteData === true) {
            const torrentCount = hashes.length;
            const filesToDelete = hashes.reduce((accumulator, _hash, hashIndex) => {
              const fileList = (response as string[][][][][])[hashIndex][0];
              const directoryBase = (response as string[][])[hashIndex + torrentCount][0];

              const torrentFilesToDelete = fileList.reduce((fileListAccumulator, file) => {
                // We only look at the first path component returned because
                // if it's a directory within the torrent, then we'll remove
                // the entire directory.
                const filePath = path.join(directoryBase, file[0][0]);

                // filePath might be a directory, so it may have already been
                // added. If not, we add it.
                if (!fileListAccumulator.includes(filePath)) {
                  fileListAccumulator.push(filePath);
                }

                return fileListAccumulator;
              }, [] as Array<string>);

              return accumulator.concat(torrentFilesToDelete);
            }, [] as Array<string>);

            filesToDelete.forEach((file) => {
              try {
                if (fs.lstatSync(file).isDirectory()) {
                  fs.rmdirSync(file, {recursive: true});
                } else {
                  fs.unlinkSync(file);
                }
              } catch (error) {
                console.error(`Error deleting file: ${file}\n${error}`);
              }
            });
          }
        }) || Promise.reject()
    );
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

    return (
      this.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then(() => {
          // returns nothing.
        }) || Promise.reject()
    );
  }

  async setTorrentsTags({hashes, tags}: SetTorrentsTagsOptions): Promise<void> {
    const methodCalls = hashes.reduce((accumulator: MultiMethodCalls, hash) => {
      accumulator.push({
        methodName: 'd.custom1.set',
        params: [hash, encodeTags(tags)],
      });

      return accumulator;
    }, []);

    return (
      this.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then(() => {
          // returns nothing.
        }) || Promise.reject()
    );
  }

  async setTorrentsTrackers({hashes, trackers}: SetTorrentsTrackersOptions): Promise<void> {
    const methodCalls = hashes.reduce(
      (accumulator: MultiMethodCalls, hash) => {
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
      },
      [
        {
          methodName: 'session.path',
          params: [],
        },
      ],
    );

    return (
      this.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then(async (response: string[][]) => {
          const [session] = response.shift() as string[];

          if (typeof session === 'string') {
            // Deduplicate hashes via Set() to avoid file ops on the same files
            await Promise.all(
              [...new Set(hashes)].map(async (hash) => {
                const torrent = path.join(session, sanitize(`${hash}.torrent`));
                return setTrackers(torrent, trackers);
              }),
            );
          }
        }) || Promise.reject()
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

    return (
      this.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then(() => {
          // returns nothing.
        }) || Promise.reject()
    );
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

    return (
      this.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then(() => {
          // returns nothing.
        }) || Promise.reject()
    );
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

    return (
      this.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then(() => {
          // returns nothing.
        }) || Promise.reject()
    );
  }

  async fetchTorrentList(): Promise<TorrentListSummary> {
    const configs = torrentListMethodCallConfigs;
    return (
      this.clientRequestManager
        .methodCall('d.multicall2', ['', 'main'].concat(getMethodCalls(configs)))
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then((responses: string[][]) => {
          this.emit('PROCESS_TORRENT_LIST_START');
          return Promise.all(responses.map((response) => processMethodCallResponse(response, configs)));
        })
        .then(async (processedResponses) => {
          const torrentList: TorrentList = Object.assign(
            {},
            ...(await Promise.all(
              processedResponses.map(async (response) => {
                const torrentProperties: TorrentProperties = {
                  ...response,
                  status: getTorrentStatusFromProperties(response),
                  percentComplete: getTorrentPercentCompleteFromProperties(response),
                  eta: getTorrentETAFromProperties(response),
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
        }) || Promise.reject()
    );
  }

  async fetchTransferSummary(): Promise<TransferSummary> {
    const configs = transferSummaryMethodCallConfigs;
    const methodCalls: MultiMethodCalls = getMethodCalls(configs).map((methodCall) => {
      return {
        methodName: methodCall,
        params: [],
      };
    });

    return (
      this.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then((response) => {
          return processMethodCallResponse(response, configs);
        }) || Promise.reject()
    );
  }

  async getClientSettings(): Promise<ClientSettings> {
    const configs = clientSettingMethodCallConfigs;
    const methodCalls: MultiMethodCalls = getMethodCalls(configs).map((methodCall) => {
      return {
        methodName: methodCall,
        params: [],
      };
    });

    return (
      this.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then((response) => {
          return processMethodCallResponse(response, configs);
        }) || Promise.reject()
    );
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
        case 'throttleGlobalDownMax':
        case 'throttleGlobalUpMax':
          // Kb/s to B/s
          methodName = `${configs[property].methodCall}.set`;
          param = (param as ClientSettings[typeof property]) * 1024;
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

    return (
      this.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then(() => {
          // returns nothing.
        }) || Promise.reject()
    );
  }

  async testGateway(): Promise<void> {
    return this.clientRequestManager
      .methodCall('system.methodExist', ['system.multicall'])
      .then(() => this.processClientRequestSuccess(undefined), this.processClientRequestError);
  }
}

export default RTorrentClientGatewayService;
