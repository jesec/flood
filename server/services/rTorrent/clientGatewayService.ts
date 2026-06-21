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
import type {MultiMethodCalls} from './util/rTorrentMethodCallUtil';
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
  clientSetting: string[];
  torrentContent: string[];
  torrentList: string[];
  torrentPeer: string[];
  torrentTracker: string[];
  transferSummary: string[];
};

const EMPTY_METHOD_CALLS: AvailableMethodCalls = {
  methodList: [],
  clientSetting: [],
  torrentContent: [],
  torrentList: [],
  torrentPeer: [],
  torrentTracker: [],
  transferSummary: [],
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

  return {
    methodList,
    clientSetting: getAvailableMethodCalls(getMethodCalls(clientSettingMethodCallConfigs)),
    torrentContent: getAvailableMethodCalls(getMethodCalls(torrentContentMethodCallConfigs)),
    torrentList: getAvailableMethodCalls(getMethodCalls(torrentListMethodCallConfigs)),
    torrentPeer: getAvailableMethodCalls(getMethodCalls(torrentPeerMethodCallConfigs)),
    torrentTracker: getAvailableMethodCalls(getMethodCalls(torrentTrackerMethodCallConfigs)),
    transferSummary: getAvailableMethodCalls(getMethodCalls(transferSummaryMethodCallConfigs)),
  };
}

async function linkFile(sourcePath: string, destPath: string): Promise<boolean> {
  try {
    await fs.promises.unlink(destPath).catch(() => undefined);
    await fs.promises.link(sourcePath, destPath);
    return true;
  } catch {
    return false;
  }
}

async function* copyFile(sourcePath: string, destPath: string): AsyncGenerator<number> {
  const CHUNK_SIZE = 64 * 1024;
  const buf = Buffer.allocUnsafe(CHUNK_SIZE);

  const src = await fs.promises.open(sourcePath, 'r');
  const dst = await fs.promises.open(destPath, 'w');

  try {
    let bytesCopied = 0;
    let bytesRead: number;

    while ((bytesRead = (await src.read(buf, 0, CHUNK_SIZE, bytesCopied)).bytesRead) > 0) {
      await dst.write(buf.subarray(0, bytesRead));
      bytesCopied += bytesRead;
      yield bytesCopied;
    }
  } finally {
    await Promise.all([src.close(), dst.close()]);
  }
}

class RTorrentClientGatewayService extends BaseClientGatewayService implements ClientGatewayService {
  clientRequestManager: ClientRequestManager;
  availableMethodCalls: AvailableMethodCalls;

  private moveProgress: Map<string, {bytesDone: number; totalBytes: number}> = new Map();
  private moveQueue: MoveTorrentsOptions[] = [];
  private moveQueueNotify: (() => void) | null = null;

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
        files: files.map((file) => file.toString('base64')) as [string, ...string[]],
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

  onServicesUpdated = () => {
    // Start background move queue consumer when services are wired up
    this.runMoveQueue().catch(() => undefined);
  };

  async moveTorrents(options: MoveTorrentsOptions): Promise<void> {
    // Dedup: remove any existing queue entries that overlap with incoming hashes
    const incomingHashes = new Set(options.hashes);
    this.moveQueue = this.moveQueue.filter((queued) => !queued.hashes.some((h) => incomingHashes.has(h)));
    this.moveQueue.push(options);

    // Signal the background consumer
    if (this.moveQueueNotify) {
      this.moveQueueNotify();
      this.moveQueueNotify = null;
    }
  }

  private async runMoveQueue(): Promise<void> {
    while (true) {
      while (this.moveQueue.length > 0) {
        const options = this.moveQueue.shift()!;

        // Skip hashes that are already being moved
        const activeHashes = options.hashes.filter((h) => !this.moveProgress.has(h));
        if (activeHashes.length === 0) {
          continue;
        }

        try {
          await this.doMoveTorrents({...options, hashes: activeHashes});
        } catch {
          // Continue processing next items even if one fails
        }
      }

      // Wait for new items
      await new Promise<void>((resolve) => {
        this.moveQueueNotify = resolve;
      });
    }
  }

  private async doMoveTorrents({
    hashes,
    destination,
    moveFiles,
    isBasePath,
    isCheckHash,
  }: MoveTorrentsOptions): Promise<void> {
    await fs.promises.mkdir(destination, {recursive: true});

    // Collect files to copy and source paths to delete afterwards
    type TorrentFilePlan = {
      hash: string;
      isCompleted: boolean;
      sourceDirectory: string;
      files: {sourcePath: string; destPath: string; sizeBytes: number; dev: number}[];
      totalBytes: number;
    };
    const plans: TorrentFilePlan[] = [];

    if (moveFiles) {
      const isMultiFile = await this.clientRequestManager
        .methodCall('system.multicall', [
          hashes.map((hash) => ({
            methodName: 'd.is_multi_file',
            params: [hash],
          })),
        ])
        .then(this.processClientRequestSuccess, this.processRTorrentRequestError)
        .then((responses: string[][]): boolean[] =>
          responses.map((response) => (typeof response === 'number' ? response !== 0 : response?.[0] !== '0')),
        )
        .catch(() => undefined);

      if (isMultiFile == null || isMultiFile.length !== hashes.length) {
        throw new Error();
      }

      // Gather file plans for each torrent
      for (const [index, hash] of hashes.entries()) {
        const torrent = this.services?.torrentService.getTorrent(hash);
        if (torrent == null) {
          continue;
        }

        const {directory, name} = torrent;
        if (directory == null || name == null) {
          continue;
        }

        const sourceDirectory = path.resolve(directory);
        const destDirectory = isMultiFile[index]
          ? path.resolve(isBasePath ? destination : path.join(destination, name))
          : path.resolve(destination);

        if (sourceDirectory === destDirectory) {
          continue;
        }

        const contents = await this.getTorrentContents(hash);

        const files: TorrentFilePlan['files'] = [];
        let totalBytes = 0;

        for (const content of contents) {
          const sourcePath = sanitizePath(path.resolve(sourceDirectory, content.path));
          if (!isAllowedPath(sourcePath)) {
            continue;
          }

          const destPath = sanitizePath(path.resolve(destDirectory, content.path));
          if (!isAllowedPath(destPath)) {
            continue;
          }

          let sourceStat: fs.Stats;
          try {
            sourceStat = await fs.promises.stat(sourcePath);
          } catch {
            continue;
          }

          if (!sourceStat.isFile()) {
            continue;
          }

          files.push({sourcePath, destPath, sizeBytes: sourceStat.size, dev: sourceStat.dev});
          totalBytes += sourceStat.size;
        }

        if (files.length > 0) {
          plans.push({
            hash,
            isCompleted: torrent.percentComplete === 100,
            sourceDirectory,
            files,
            totalBytes,
          });
        }
      }

      // Phase 1: Copy files (no deletion yet)
      for (const plan of plans) {
        const {hash, isCompleted, files, totalBytes} = plan;

        // Stop downloading torrents before copy; completed ones keep running
        if (!isCompleted) {
          await this.stopTorrents({hashes: [hash]});
        }

        // Register progress and trigger first poll to show 0%
        this.moveProgress.set(hash, {bytesDone: 0, totalBytes});
        this.services?.torrentService.fetchTorrentList();

        let bytesDone = 0;
        let lastProgressEmit = 0;

        for (const file of files) {
          const {sourcePath, destPath, sizeBytes, dev: sourceDev} = file;

          // Check if this torrent's move was superseded by a newer queue entry
          if (!this.moveProgress.has(hash)) {
            break;
          }

          await fs.promises.mkdir(path.dirname(destPath), {recursive: true});

          if (sourcePath === destPath) {
            bytesDone += sizeBytes;
            continue;
          }

          // Determine same-fs vs cross-fs by comparing device ID
          let destDirDev: number;
          try {
            destDirDev = (await fs.promises.stat(path.dirname(destPath))).dev;
          } catch {
            continue;
          }

          if (sourceDev === destDirDev) {
            // Same filesystem: hardlink (instant)
            if (!(await linkFile(sourcePath, destPath))) {
              continue;
            }
            bytesDone += sizeBytes;
          } else {
            // Different filesystem: stream copy with progress tracking
            const fileStartBytes = bytesDone;
            for await (const copied of copyFile(sourcePath, destPath)) {
              bytesDone = fileStartBytes + copied;
              const now = Date.now();
              if (now - lastProgressEmit >= 200) {
                this.moveProgress.set(hash, {bytesDone, totalBytes});
                this.services?.torrentService.fetchTorrentList();
                lastProgressEmit = now;
              }
            }
            bytesDone = fileStartBytes + sizeBytes;
          }

          // Emit progress after each file
          this.moveProgress.set(hash, {bytesDone, totalBytes});
          this.services?.torrentService.fetchTorrentList();
        }
      }
    }

    // Phase 2: Set directories in rTorrent
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

    // Phase 3: Delete source files now that rTorrent knows the new location
    for (const plan of plans) {
      const {hash, isCompleted, sourceDirectory, files} = plan;

      await Promise.all(files.map((file) => fs.promises.unlink(file.sourcePath).catch(() => undefined)));

      // Stop completed torrents now that files are moved
      if (isCompleted) {
        await this.stopTorrents({hashes: [hash]});
      }

      this.moveProgress.delete(hash);
      await cleanupEmptyDirectories(sourceDirectory);
    }

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
              const moveProg = this.moveProgress.get(response.hash);

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
                percentComplete: moveProg
                  ? (moveProg.bytesDone / moveProg.totalBytes) * 100
                  : getTorrentPercentCompleteFromProperties(effectiveSizeBytes, response.bytesDone),
                priority: response.priority,
                ratio: response.ratio,
                seedsConnected: response.seedsConnected,
                seedsTotal: response.seedsTotal,
                sizeBytes: effectiveSizeBytes,
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
    const methodCalls: MultiMethodCalls = this.availableMethodCalls.transferSummary.map((methodCall) => {
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
    const methodCalls: MultiMethodCalls = this.availableMethodCalls.clientSetting.map((methodCall) => {
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
