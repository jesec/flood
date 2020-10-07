import path from 'path';
import fs from 'fs';
import {moveSync} from 'fs-extra';

import type {Credentials} from '@shared/types/Auth';
import type {TorrentList, TorrentListSummary, TorrentProperties} from '@shared/types/Torrent';
import type {TransferSummary} from '@shared/types/TransferData';
import type {
  CheckTorrentsOptions,
  DeleteTorrentsOptions,
  MoveTorrentsOptions,
  SetTorrentsPriorityOptions,
  StartTorrentsOptions,
  StopTorrentsOptions,
} from '@shared/types/Action';

import {accessDeniedError, isAllowedPath, sanitizePath} from '../util/fileUtil';
import BaseService from './BaseService';
import fileListMethodCallConfigs from '../constants/fileListMethodCallConfigs';
import scgiUtil from '../util/scgiUtil';

import type {MethodCallConfigs, MultiMethodCalls} from '../constants/rTorrentMethodCall';

const filePathMethodCalls = fileListMethodCallConfigs
  .filter((config) => config.propLabel === 'pathComponents')
  .map((config) => config.methodCall);

interface ClientGatewayServiceEvents {
  CLIENT_CONNECTION_STATE_CHANGE: () => void;
  PROCESS_TORRENT_LIST_START: () => void;
  PROCESS_TORRENT_LIST_END: (processedTorrentList: {torrents: TorrentList}) => void;
  PROCESS_TORRENT: (processedTorrentDetailValues: TorrentProperties) => void;
  PROCESS_TRANSFER_RATE_START: () => void;
}

interface TorrentListReducer<T extends keyof TorrentProperties = keyof TorrentProperties> {
  key: T;
  reduce: (properties: Record<string, unknown>) => TorrentProperties[T];
}

class ClientGatewayService extends BaseService<ClientGatewayServiceEvents> {
  hasError: boolean | null = null;
  torrentListReducers: Array<TorrentListReducer> = [];

  constructor(...args: ConstructorParameters<typeof BaseService>) {
    super(...args);

    this.processClientRequestError = this.processClientRequestError.bind(this);
    this.processClientRequestSuccess = this.processClientRequestSuccess.bind(this);
  }

  /**
   * Adds a reducer to be applied when processing the torrent list.
   *
   * @param {Object} reducer - The reducer object
   * @param {string} reducer.key - The key of the reducer, to be applied to the
   *   torrent list object.
   * @param {function} reducer.reduce - The actual reducer. This will receive
   *   the entire processed torrent list response and it should return it own
   *   processed value, to be assigned to the provided key.
   */
  addTorrentListReducer<T extends TorrentListReducer>(reducer: T) {
    if (typeof reducer.key !== 'string') {
      throw new Error('reducer.key must be a string.');
    }

    if (typeof reducer.reduce !== 'function') {
      throw new Error('reducer.reduce must be a function.');
    }

    this.torrentListReducers.push(reducer);
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

    return this.services?.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processClientRequestError);
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
          return;
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

    return this.services?.clientRequestManager.methodCall('system.multicall', [methodCalls]).then((response) => {
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
    }, this.processClientRequestError);
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

    return this.services?.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processClientRequestError);
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

    return this.services?.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processClientRequestError);
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

    return this.services?.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  /**
   * Sends a multicall request to rTorrent with the requested method calls.
   *
   * @param {MethodCallConfigs} configs - An array of method call config...
   * @return {Promise} - Resolves with the processed client response or rejects
   *   with the processed client error.
   */
  async fetchTorrentList(configs: MethodCallConfigs) {
    return (
      this.services?.clientRequestManager
        .methodCall('d.multicall2', ['', 'main'].concat(configs.map((config) => config.methodCall)))
        .then(this.processClientRequestSuccess)
        .then(
          (torrents) => this.processTorrentListResponse(torrents as Array<Array<string>>, configs),
          this.processClientRequestError,
        ) || Promise.reject()
    );
  }

  async fetchTransferSummary(configs: MethodCallConfigs) {
    const methodCalls: MultiMethodCalls = configs.map((config) => {
      return {
        methodName: config.methodCall,
        params: [],
      };
    });

    return (
      this.services?.clientRequestManager
        .methodCall('system.multicall', [methodCalls])
        .then(this.processClientRequestSuccess)
        .then(
          (transferRate) => this.processTransferRateResponse(transferRate as Array<string>, configs),
          this.processClientRequestError,
        ) || Promise.reject()
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

  /**
   * After rTorrent responds with the requested torrent details, we construct
   * an object with hashes as keys and processed details as values.
   *
   * @param {Array} response - The array of all torrents and their details.
   * @param {MethodCallConfigs} configs - An array of method call config...
   * @return {Object} - An object that represents all torrents with hashes as
   *   keys, each value being an object of detail labels and values.
   */
  async processTorrentListResponse(
    torrentList: Array<Array<string>>,
    configs: MethodCallConfigs,
  ): Promise<TorrentListSummary> {
    this.emit('PROCESS_TORRENT_LIST_START');

    // We map the array of details to objects with sensibly named keys. We want
    // to return an object with torrent hashes as keys and an object of torrent
    // details as values.
    const processedTorrentList = Object.assign(
      {},
      ...(await Promise.all(
        torrentList.map(async (torrentDetailValues) => {
          // Transform the array of torrent detail values to an object with
          // sensibly named keys.
          const processingTorrentDetailValues = torrentDetailValues.reduce(
            (accumulator: Record<string, unknown>, value: string, index: number) => {
              const {propLabel, transformValue} = configs[index];

              accumulator[propLabel] = transformValue(value);

              return accumulator;
            },
            {},
          );

          // Assign values from external reducers to the torrent list object.
          this.torrentListReducers.forEach((reducer) => {
            const {key, reduce} = reducer;
            processingTorrentDetailValues[key] = reduce(processingTorrentDetailValues);
          });

          const processedTorrentDetailValues = (processingTorrentDetailValues as unknown) as TorrentProperties;

          this.emit('PROCESS_TORRENT', processedTorrentDetailValues);

          return {
            [processedTorrentDetailValues.hash]: processedTorrentDetailValues,
          };
        }),
      )),
    ) as TorrentList;

    const torrentListSummary = {
      id: Date.now(),
      torrents: processedTorrentList,
    };

    this.emit('PROCESS_TORRENT_LIST_END', torrentListSummary);

    return torrentListSummary;
  }

  async processTransferRateResponse(transferRate: Array<string>, configs: MethodCallConfigs) {
    this.emit('PROCESS_TRANSFER_RATE_START');

    return Object.assign(
      {},
      ...transferRate.map((value, index) => {
        const {propLabel, transformValue} = configs[index];
        return {
          [propLabel]: transformValue(value),
        };
      }),
    ) as TransferSummary;
  }

  testGateway(clientSettings?: Pick<Credentials, 'socketPath' | 'port' | 'host'>) {
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
      {
        socketPath: clientSettings.socketPath,
        port: clientSettings.port,
        host: clientSettings.host,
      },
      'system.methodExist',
      ['system.multicall'],
    );
  }
}

export default ClientGatewayService;
