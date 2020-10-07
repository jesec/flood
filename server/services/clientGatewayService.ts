import path from 'path';
import fs from 'fs';
import geoip from 'geoip-country';
import {moveSync} from 'fs-extra';

import type {RTorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import type {TorrentContentTree} from '@shared/types/TorrentContent';
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
  StartTorrentsOptions,
  StopTorrentsOptions,
} from '@shared/types/api/torrents';

import {accessDeniedError, createDirectory, isAllowedPath, sanitizePath} from '../util/fileUtil';
import BaseService from './BaseService';
import {getFileTreeFromPathsArr} from '../util/fileTreeUtil';
import scgiUtil from '../util/scgiUtil';
import {getMethodCalls, processMethodCallResponse} from '../util/rTorrentMethodCallUtil';
import {
  encodeTags,
  getTorrentETAFromProperties,
  getTorrentPercentCompleteFromProperties,
  getTorrentStatusFromProperties,
} from '../util/torrentPropertiesUtil';
import {
  torrentContentMethodCallConfigs,
  torrentListMethodCallConfigs,
  torrentPeerMethodCallConfigs,
  torrentTrackerMethodCallConfigs,
  transferSummaryMethodCallConfigs,
} from '../constants/rTorrentMethodCallConfigs';

import type {MultiMethodCalls} from '../util/rTorrentMethodCallUtil';

const filePathMethodCalls = getMethodCalls({pathComponents: torrentContentMethodCallConfigs.pathComponents});

interface ClientGatewayServiceEvents {
  CLIENT_CONNECTION_STATE_CHANGE: () => void;
  PROCESS_TORRENT_LIST_START: () => void;
  PROCESS_TORRENT_LIST_END: (torrentListSummary: TorrentListSummary) => void;
  PROCESS_TORRENT: (torrentProperties: TorrentProperties) => void;
  PROCESS_TRANSFER_RATE_START: () => void;
}

class ClientGatewayService extends BaseService<ClientGatewayServiceEvents> {
  hasError: boolean | null = null;

  constructor(...args: ConstructorParameters<typeof BaseService>) {
    super(...args);

    this.processClientRequestError = this.processClientRequestError.bind(this);
    this.processClientRequestSuccess = this.processClientRequestSuccess.bind(this);
  }

  /**
   * Adds torrents by file
   *
   * @param {AddTorrentByFileOptions} options - An object of options...
   * @return {Promise} - Resolves with RPC call response or rejects with error.
   */
  async addTorrentsByFile({files, destination, tags, isBasePath, start}: AddTorrentByFileOptions) {
    const destinationPath = sanitizePath(destination);

    if (!isAllowedPath(destinationPath)) {
      throw accessDeniedError();
    }

    createDirectory(destinationPath);

    // Each torrent is sent individually because rTorrent might have small
    // XMLRPC request size limit. This allows the user to send files reliably.
    return Promise.all(
      files.map(async (file) => {
        const additionalCalls: Array<string> = [];

        additionalCalls.push(`${isBasePath ? 'd.directory_base.set' : 'd.directory.set'}="${destinationPath}"`);

        if (Array.isArray(tags)) {
          additionalCalls.push(`d.custom1.set=${encodeTags(tags)}`);
        }

        additionalCalls.push(`d.custom.set=addtime,${Date.now() / 1000}`);

        return (
          this.services?.clientRequestManager
            .methodCall(
              start ? 'load.raw_start' : 'load.raw',
              ['', Buffer.from(file, 'base64')].concat(additionalCalls),
            )
            .then(this.processClientRequestSuccess, this.processClientRequestError) || Promise.reject()
        );
      }),
    );
  }

  /**
   * Adds torrents by URL
   *
   * @param {AddTorrentByURLOptions} options - An object of options...
   * @return {Promise} - Resolves with RPC call response or rejects with error.
   */
  async addTorrentsByURL({urls, destination, tags, isBasePath, start}: AddTorrentByURLOptions) {
    const destinationPath = sanitizePath(destination);

    if (!isAllowedPath(destinationPath)) {
      throw accessDeniedError();
    }

    createDirectory(destinationPath);

    const methodCalls: MultiMethodCalls = urls.map((url) => {
      const additionalCalls: Array<string> = [];

      additionalCalls.push(`${isBasePath ? 'd.directory_base.set' : 'd.directory.set'}="${destinationPath}"`);

      if (Array.isArray(tags)) {
        additionalCalls.push(`d.custom1.set=${encodeTags(tags)}`);
      }

      additionalCalls.push(`d.custom.set=addtime,${Date.now() / 1000}`);

      return {
        methodName: start ? 'load.start' : 'load.normal',
        params: ['', url].concat(additionalCalls),
      };
    }, []);

    return (
      this.services?.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError) || Promise.reject()
    );
  }

  /**
   * Checks torrents
   *
   * @param {CheckTorrentsOptions} options - An object of options...
   * @return {Promise} - Resolves with RPC call response or rejects with error.
   */
  async checkTorrents({hashes}: CheckTorrentsOptions) {
    const methodCalls = hashes.reduce((accumulator: MultiMethodCalls, hash) => {
      accumulator.push({
        methodName: 'd.check_hash',
        params: [hash],
      });

      return accumulator;
    }, []);

    return (
      this.services?.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError) || Promise.reject()
    );
  }

  /**
   * Gets the list of contents of a torrent.
   *
   * @param {string} hash - Hash of torrent
   * @return {Promise<TorrentContentTree>} - Resolves with TorrentContentTree or rejects with error.
   */
  async getTorrentContents(hash: TorrentProperties['hash']): Promise<TorrentContentTree> {
    const configs = torrentContentMethodCallConfigs;
    return (
      this.services?.clientRequestManager
        .methodCall('f.multicall', [hash, ''].concat(getMethodCalls(configs)))
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then((responses: string[][]) => {
          return Promise.all(responses.map((response) => processMethodCallResponse(response, configs)));
        })
        .then((processedResponses) => {
          return processedResponses.reduce(
            (memo, content, index) => getFileTreeFromPathsArr(memo, content.pathComponents[0], {index, ...content}),
            {},
          );
        }) || Promise.reject()
    );
  }

  /**
   * Gets the list of peers of a torrent.
   *
   * @param {string} hash - Hash of torrent
   * @return {Promise<Array<TorrentPeer>>} - Resolves with an array of TorrentPeer or rejects with error.
   */
  async getTorrentPeers(hash: TorrentProperties['hash']): Promise<Array<TorrentPeer>> {
    const configs = torrentPeerMethodCallConfigs;
    return (
      this.services?.clientRequestManager
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

  /**
   * Gets the list of trackers of a torrent.
   *
   * @param {string} hash - Hash of torrent
   * @return {Promise<Array<TorrentTracker>>} - Resolves with an array of TorrentTracker or rejects with error.
   */
  async getTorrentTrackers(hash: TorrentProperties['hash']): Promise<Array<TorrentTracker>> {
    const configs = torrentTrackerMethodCallConfigs;
    return (
      this.services?.clientRequestManager
        .methodCall('t.multicall', [hash, ''].concat(getMethodCalls(configs)))
        .then(this.processClientRequestSuccess, this.processClientRequestError)
        .then((responses: string[][]) => {
          return Promise.all(
            responses.map((response) => processMethodCallResponse(response, configs) as Promise<TorrentTracker>),
          );
        }) || Promise.reject()
    );
  }

  /**
   * Moves torrents to specified destination path.
   * This function requires that the destination path is allowed by config.
   *
   * @param {MoveTorrentsOptions} options - An object of options...
   * @return {Promise} - Resolves with the processed client response or rejects with the processed client error.
   */
  async moveTorrents({hashes, destination, moveFiles, isBasePath, isCheckHash}: MoveTorrentsOptions) {
    const resolvedPath = sanitizePath(destination);
    if (!isAllowedPath(resolvedPath)) {
      throw accessDeniedError();
    }

    const hashesToRestart: Array<string> = [];

    const methodCalls = hashes.reduce((accumulator: MultiMethodCalls, hash) => {
      accumulator.push({
        methodName: isBasePath ? 'd.directory_base.set' : 'd.directory.set',
        params: [hash, resolvedPath],
      });

      if (!this.services?.torrentService.getTorrent(hash).status.includes('stopped')) {
        hashesToRestart.push(hash);
      }

      return accumulator;
    }, []);

    await this.stopTorrents({hashes}).catch((e) => {
      throw e;
    });

    await this.services?.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processClientRequestError)
      .catch((e) => {
        throw e;
      });

    if (moveFiles) {
      hashes.forEach((hash) => {
        const sourceBasePath = this.services?.torrentService.getTorrent(hash).basePath;
        const baseFileName = this.services?.torrentService.getTorrent(hash).baseFilename;

        if (sourceBasePath == null || baseFileName == null) {
          throw new Error();
        }

        const destinationFilePath = sanitizePath(path.join(resolvedPath, baseFileName));
        if (sourceBasePath !== destinationFilePath) {
          try {
            moveSync(sourceBasePath, destinationFilePath, {overwrite: true});
          } catch (err) {
            console.error(`Failed to move files to ${resolvedPath}.`);
            console.error(err);
          }
        }
      });
    }

    if (isCheckHash) {
      await this.checkTorrents({hashes}).catch((e) => {
        throw e;
      });
    }

    return this.startTorrents({hashes: hashesToRestart});
  }

  /**
   * Removes torrents from rTorrent's session. Optionally deletes data of torrents.
   *
   * @param {DeleteTorrentsOptions} options - An object of options...
   * @return {Promise} - Resolves with the processed client response or rejects with the processed client error.
   */
  async removeTorrents({hashes, deleteData}: DeleteTorrentsOptions) {
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
      this.services?.clientRequestManager.methodCall('system.multicall', [methodCalls]).then((response) => {
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

        return response;
      }, this.processClientRequestError) || Promise.reject()
    );
  }

  /**
   * Sets priority of torrents
   *
   * @param {SetTorrentsPriorityOptions} options - An object of options...
   * @return {Promise} - Resolves with RPC call response or rejects with error.
   */
  async setTorrentsPriority({hashes, priority}: SetTorrentsPriorityOptions) {
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
      this.services?.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError) || Promise.reject()
    );
  }

  /**
   * Sets tags of torrents
   *
   * @param {SetTorrentsTagsOptions} options - An object of options...
   * @return {Promise} - Resolves with RPC call response or rejects with error.
   */
  async setTorrentsTags({hashes, tags}: SetTorrentsTagsOptions) {
    const methodCalls = hashes.reduce((accumulator: MultiMethodCalls, hash) => {
      accumulator.push({
        methodName: 'd.custom1.set',
        params: [hash, encodeTags(tags)],
      });

      return accumulator;
    }, []);

    return (
      this.services?.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError) || Promise.reject()
    );
  }

  /**
   * Sets priority of contents of a torrent
   * @param {string} hash - Hash of the torrent.
   * @param {Array<number>} indices - Indices of contents to be altered.
   * @param {number} priority - Target priority.
   * @return {Promise} - Resolves with RPC call response or rejects with error.
   */
  async setTorrentContentsPriority(hash: string, {indices, priority}: SetTorrentContentsPropertiesOptions) {
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
      this.services?.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError) || Promise.reject()
    );
  }

  /**
   * Starts torrents
   *
   * @param {StartTorrentsOptions} options - An object of options...
   * @return {Promise} - Resolves with RPC call response or rejects with error.
   */
  async startTorrents({hashes}: StartTorrentsOptions) {
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
      this.services?.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError) || Promise.reject()
    );
  }

  /**
   * Stops torrents
   *
   * @param {StopTorrentsOptions} options - An object of options...
   * @return {Promise} - Resolves with RPC call response or rejects with error.
   */
  async stopTorrents({hashes}: StopTorrentsOptions) {
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
      this.services?.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess, this.processClientRequestError) || Promise.reject()
    );
  }

  /**
   * Fetches the list of torrents
   *
   * @return {Promise<TorrentListSummary>} - Resolves with TorrentListSummary or rejects with error.
   */
  async fetchTorrentList(): Promise<TorrentListSummary> {
    const configs = torrentListMethodCallConfigs;
    return (
      this.services?.clientRequestManager
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

  /**
   * Fetches the transfer summary
   *
   * @return {Promise<TransferSummary>} - Resolves with TransferSummary or rejects with error.
   */
  async fetchTransferSummary(): Promise<TransferSummary> {
    const configs = transferSummaryMethodCallConfigs;
    const methodCalls: MultiMethodCalls = getMethodCalls(configs).map((methodCall) => {
      return {
        methodName: methodCall,
        params: [],
      };
    });

    return (
      this.services?.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess)
        .then((response) => {
          this.emit('PROCESS_TRANSFER_RATE_START');
          return processMethodCallResponse(response, configs);
        }, this.processClientRequestError) || Promise.reject()
    );
  }

  processClientRequestSuccess<T>(response: T): T {
    if (this.hasError == null || this.hasError === true) {
      this.hasError = false;
      this.emit('CLIENT_CONNECTION_STATE_CHANGE');
    }

    return response;
  }

  processClientRequestError(error: Error) {
    if (!this.hasError) {
      this.hasError = true;
      this.emit('CLIENT_CONNECTION_STATE_CHANGE');
    }
    return Promise.reject(error);
  }

  testGateway(clientSettings?: RTorrentConnectionSettings) {
    if (clientSettings == null) {
      if (this.services != null && this.services.clientRequestManager != null) {
        return this.services.clientRequestManager
          .methodCall('system.methodExist', ['system.multicall'])
          .then(this.processClientRequestSuccess)
          .catch(this.processClientRequestError);
      }
      return Promise.reject();
    }

    return scgiUtil.methodCall(
      clientSettings.type === 'socket'
        ? {
            socketPath: clientSettings.socket,
          }
        : {
            host: clientSettings.host,
            port: clientSettings.port,
          },
      'system.methodExist',
      ['system.multicall'],
    );
  }
}

export default ClientGatewayService;
