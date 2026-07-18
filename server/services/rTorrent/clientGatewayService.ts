import fs from 'node:fs';
import path from 'node:path';

import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  ReannounceTorrentsOptions,
  SetTorrentsTagsOptions,
} from '@shared/schema/api/torrents';
import type {UserInDatabase} from '@shared/schema/Auth';
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
import {cleanupEmptyDirectories, isAllowedPath, sanitizePath} from '../../util/fileUtil';
import {getComment, setCompleted, setTrackers} from '../../util/torrentFileUtil';
import BaseClientGatewayService, {type ClientGatewayService} from '../clientGatewayService';
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
import type {MethodCallConfig, MethodCallConfigs, MultiMethodCalls} from './util/rTorrentMethodCallUtil';
import {getMethodCalls, processMethodCallResponse} from './util/rTorrentMethodCallUtil';
import {
  encodeTags,
  getAddTorrentPropertiesCalls,
  getTorrentETAFromProperties,
  getTorrentPercentCompleteFromProperties,
  getTorrentStatusFromProperties,
} from './util/torrentPropertiesUtil';

type AvailableMethodCalls = {
  methodList: string[];
  clientSetting: MethodCallConfigs;
  torrentContent: string[];
  torrentList: string[];
  torrentPeer: string[];
  torrentTracker: string[];
  transferSummary: MethodCallConfigs;
};

const EMPTY_METHOD_CALLS: AvailableMethodCalls = {
  methodList: [],
  clientSetting: {},
  torrentContent: [],
  torrentList: [],
  torrentPeer: [],
  torrentTracker: [],
  transferSummary: {},
};

/**
 * Filter configs by available methods, resolving alternative method names
 * to the single method that is actually available on this rTorrent instance.
 */
const resolveMethodCallConfigs = (configs: MethodCallConfigs, methodList: string[]): MethodCallConfigs => {
  const resolved: Record<string, MethodCallConfig> = {};
  // Sort keys so that Object.values(configs) (methodCalls) and
  // Object.keys(configs) (processMethodCallResponse) stay in sync.
  for (const key of Object.keys(configs).sort()) {
    const config = configs[key];
    const methods = Array.isArray(config.methodCall) ? config.methodCall : [config.methodCall];
    const availableMethod = methodList.length > 0 ? methods.find((m) => methodList.includes(m)) : methods[0];
    if (availableMethod) {
      resolved[key] = {methodCall: availableMethod, transformValue: config.transformValue};
    }
  }
  return resolved;
};

async function fetchAvailableMethodCalls(
  clientRequestManager: ClientRequestManager,
  fallback = false,
): Promise<AvailableMethodCalls> {
  let methodList: Array<string> = [];

  clientRequestManager.isJSONCapable = true;
  methodList = await clientRequestManager.methodCall('system.listMethods', []).catch((e: RPCError) => {
    if (e.isRPCError || e.name == 'SyntaxError') {
      clientRequestManager.isJSONCapable = false;
    } else if (!fallback) {
      throw e;
    }
  });

  if (!clientRequestManager.isJSONCapable) {
    methodList = await clientRequestManager.methodCall('system.listMethods', []).catch((e) => {
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

  // Resolve clientSetting and transferSummary configs at startup: pick the
  // available method from alternatives and drop unavailable entries entirely.
  // This way getClientSettings/fetchTransferSummary can use the configs directly
  // with system.multicall, without worrying about 'false=' sentinels.
  return {
    methodList,
    clientSetting: resolveMethodCallConfigs(clientSettingMethodCallConfigs, methodList),
    torrentContent: getAvailableMethodCalls(getMethodCalls(torrentContentMethodCallConfigs)),
    torrentList: getAvailableMethodCalls(getMethodCalls(torrentListMethodCallConfigs)),
    torrentPeer: getAvailableMethodCalls(getMethodCalls(torrentPeerMethodCallConfigs)),
    torrentTracker: getAvailableMethodCalls(getMethodCalls(torrentTrackerMethodCallConfigs)),
    transferSummary: resolveMethodCallConfigs(transferSummaryMethodCallConfigs, methodList),
  };
}

class RTorrentClientGatewayService extends BaseClientGatewayService implements ClientGatewayService {
  clientRequestManager: ClientRequestManager;
  availableMethodCalls: AvailableMethodCalls;

  constructor(user: UserInDatabase, availableMethodCalls: AvailableMethodCalls) {
    super(user);
    this.clientRequestManager = new ClientRequestManager(user.client as RTorrentConnectionSettings);
    this.availableMethodCalls = availableMethodCalls;
  }

  static async create(user: UserInDatabase): Promise<RTorrentClientGatewayService> {
    const clientRequestManager = new ClientRequestManager(user.client as RTorrentConnectionSettings);
    let availableMethodCalls = await fetchAvailableMethodCalls(clientRequestManager).catch(() => null);
    if (availableMethodCalls == null) {
      availableMethodCalls = EMPTY_METHOD_CALLS;
    }
    return new RTorrentClientGatewayService(user, availableMethodCalls);
  }

  // workaround: rTorrent instances might reject large d.multicall2 JSON-RPC requests
  // even though the equivalent XML-RPC call succeeds. rakshasa/rtorrent#1596
  private async fetchTorrentListResponses() {
    const methodCalls = ['', 'main'].concat(this.availableMethodCalls.torrentList);

    try {
      return await this.clientRequestManager
        .methodCall('d.multicall2', methodCalls)
        .then(this.processClientRequestSuccess, this.processRTorrentRequestError);
    } catch (error) {
      if (!this.clientRequestManager.isJSONCapable || (error as RPCError)?.code !== -32700) {
        throw error;
      }

      this.clientRequestManager.isJSONCapable = false;
      return this.clientRequestManager
        .methodCall('d.multicall2', methodCalls)
        .then(this.processClientRequestSuccess, this.processRTorrentRequestError);
    }
  }

  async getPreferredMethod(methods: string[]): Promise<string> {
    const {methodList} = this.availableMethodCalls;

    const matchedMethod = methods.find((method) => methodList.includes(method));

    if (!matchedMethod) {
      throw new Error(`None of the requested methods are available: ${methods.join(', ')}`);
    }

    return matchedMethod;
  }

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
      const methodName = await this.getPreferredMethod(
        start ? ['load.start_throw', 'load.start'] : ['load.throw', 'load.normal'],
      );

      await this.clientRequestManager
        .methodCall('system.multicall', [
          await Promise.all(
            processedFiles.map(async (file) => ({
              methodName,
              params: [
                '',
                `data:applications/x-bittorrent;base64,${file}`,
                ...(await this.appendTorrentCommentCall(file, additionalCalls)),
              ],
            })),
          ),
        ])
        .then(this.processClientRequestSuccess, this.processRTorrentRequestError);
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

    const additionalCalls = getAddTorrentPropertiesCalls({
      destination,
      isBasePath,
      isSequential,
      isInitialSeeding,
      tags,
    });

    if (urls[0]) {
      const methodName = await this.getPreferredMethod(
        start ? ['load.start_throw', 'load.start'] : ['load.throw', 'load.normal'],
      );

      await this.clientRequestManager
        .methodCall('system.multicall', [
          urls.map((url) => ({
            methodName,
            params: ['', url, ...additionalCalls],
          })),
        ])
        .then(this.processClientRequestSuccess, this.processRTorrentRequestError);
      // .then((response: Array<Array<string | number>>) => {
      //   const hashes = response.flat(2).filter((value) => typeof value === 'string') as string[];
      //   result.push(...hashes);
      // });
    }

    if (files[0]) {
      await this.addTorrentsByFile({
        files: files.map((file) => file.toString('base64')),
        destination,
        tags,
        isBasePath,
        isCompleted,
        isSequential,
        isInitialSeeding,
        start,
      });
      // .then((hashes) => {
      //   result.push(...hashes);
      // });
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
      .methodCall('f.multicall', [hash, ''].concat(this.availableMethodCalls.torrentContent))
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

  /**
   * Get the total size of files selected for download.
   * Uses rTorrent's custom attribute cache, refreshing hourly if stale.
   */
  async getSelectedSize(hash: string, cached: {selectedSize: number; lastUpdateAt: number}): Promise<number> {
    const nowSec = Math.floor(Date.now() / 1000);
    const CACHE_TTL = 3600; // 1 hour

    // Return cached value if fresh
    if (cached.lastUpdateAt > 0 && nowSec - cached.lastUpdateAt <= CACHE_TTL) {
      return cached.selectedSize;
    }

    // Cache is stale or missing — fetch file list and recalculate
    let selectedSize = cached.selectedSize;
    try {
      const contents = await this.getTorrentContents(hash);
      selectedSize = contents.reduce((sum, file) => (file.priority > 0 ? sum + file.sizeBytes : sum), 0);
    } catch {
      return cached.selectedSize;
    }

    // Write cache (best-effort, failure does not affect the returned value)
    try {
      const data = JSON.stringify({last_update_at: nowSec, selected_size: selectedSize});
      await this.clientRequestManager
        .methodCall('d.custom.set', [hash, 'flood.selected_size', data])
        .then(this.processClientRequestSuccess, this.processRTorrentRequestError);
    } catch {
      // Silently ignore cache write failures
    }

    return selectedSize;
  }

  async getTorrentPeers(hash: TorrentProperties['hash']): Promise<Array<TorrentPeer>> {
    return this.clientRequestManager
      .methodCall('p.multicall', [hash, ''].concat(this.availableMethodCalls.torrentPeer))
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
      .methodCall('t.multicall', [hash, ''].concat(this.availableMethodCalls.torrentTracker))
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

          if (sourceDirectory === destDirectory) {
            return;
          }

          const contents = await this.getTorrentContents(hash);

          for (const content of contents) {
            const sourcePath = sanitizePath(path.resolve(sourceDirectory, content.path));

            if (!fs.existsSync(sourcePath) || !isAllowedPath(sourcePath)) {
              continue;
            }

            const destPath = sanitizePath(path.resolve(destDirectory, content.path));

            if (!isAllowedPath(destPath)) {
              continue;
            }

            await fs.promises.mkdir(path.dirname(destPath), {recursive: true});

            if (sourcePath !== destPath) {
              await move(sourcePath, destPath, {overwrite: true});
            }
          }

          await cleanupEmptyDirectories(sourceDirectory);
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
    const {methodList} = this.availableMethodCalls;

    if (!methodList.includes('d.down.sequential.set')) {
      throw new Error('d.down.sequential.set is not supported by this rTorrent instance');
    }

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
      .then(async () => {
        // Force refresh the cached selected size after priority changes
        await this.getSelectedSize(hash, {selectedSize: 0, lastUpdateAt: 0});
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
    return this.fetchTorrentListResponses()
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
              const selectedSizeBytes = await this.getSelectedSize(response.hash, response.selectedSizeData);
              // Fall back to full torrent size when selected size is unavailable (cold cache + fetch error)
              const effectiveSizeBytes = selectedSizeBytes || response.sizeBytes;

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
                eta: getTorrentETAFromProperties(effectiveSizeBytes, response.downRate, response.bytesDone),
                hash: response.hash,
                isPrivate: response.isPrivate,
                isInitialSeeding: response.isInitialSeeding,
                isSequential: response.isSequential,
                message: response.message,
                name: response.name,
                peersConnected: response.peersConnected,
                peersTotal: response.peersTotal,
                percentComplete: getTorrentPercentCompleteFromProperties(effectiveSizeBytes, response.bytesDone),
                priority: response.priority,
                ratio: response.ratio,
                seedsConnected: response.seedsConnected,
                seedsTotal: response.seedsTotal,
                sizeBytes: response.sizeBytes,
                selectedSizeBytes: effectiveSizeBytes,
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
    const configs = this.availableMethodCalls.transferSummary;
    const methodCalls: MultiMethodCalls = Object.keys(configs)
      .sort()
      .map((key) => ({
        methodName: configs[key].methodCall as string,
        params: [''],
      }));

    if (methodCalls.length === 0) {
      return {} as TransferSummary;
    }

    return this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then((response) => {
        return processMethodCallResponse(response, configs as typeof transferSummaryMethodCallConfigs);
      });
  }

  async getClientSessionDirectory(): Promise<{path: string; case: 'lower' | 'upper'}> {
    return this.clientRequestManager
      .methodCall('session.path', [''])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then((response) => ({path: response, case: 'upper'}));
  }

  async getClientSettings(): Promise<ClientSettings> {
    const configs = this.availableMethodCalls.clientSetting;
    const methodCalls: MultiMethodCalls = Object.keys(configs)
      .sort()
      .map((key) => ({
        methodName: configs[key].methodCall as string,
        params: [''],
      }));

    if (methodCalls.length === 0) {
      return {} as ClientSettings;
    }

    return this.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
      .then((response) => {
        return processMethodCallResponse(response, configs as typeof clientSettingMethodCallConfigs);
      });
  }

  async setClientSettings(settings: SetClientSettingsOptions): Promise<void> {
    const configs = clientSettingMethodCallConfigs;
    const {methodList} = await this.availableMethodCalls;
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
        case 'piecesMemoryMax': {
          const pieceMethods = Array.isArray(configs[property].methodCall)
            ? configs[property].methodCall
            : [configs[property].methodCall];
          methodName = `${pieceMethods[0]}.set`;
          param = (param as ClientSettings[typeof property]) * 1024 * 1024;
          break;
        }
        default: {
          const methods = Array.isArray(configs[property].methodCall)
            ? configs[property].methodCall
            : [configs[property].methodCall];
          methodName = `${methods[0]}.set`;
          if (methodList?.length > 0) {
            for (const method of methods) {
              if (methodList.includes(`${method}.set`)) {
                methodName = `${method}.set`;
                break;
              }
            }
          }
          break;
        }
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
    this.availableMethodCalls = this.processClientRequestSuccess(
      await fetchAvailableMethodCalls(this.clientRequestManager).catch(this.processRTorrentRequestError),
    );
  }

  processRTorrentRequestError = (error: RPCError) => {
    if (!error?.isRPCError) {
      return this.processClientRequestError(error);
    }

    throw error;
  };
}

export default RTorrentClientGatewayService;
