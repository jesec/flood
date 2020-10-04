import path from 'path';
import fs from 'fs';
import {moveSync} from 'fs-extra';

import type {Credentials} from '@shared/types/Auth';
import type {TorrentProperties, Torrents} from '@shared/types/Torrent';
import type {TransferSummary} from '@shared/types/TransferData';
import type {
  CheckTorrentsOptions,
  DeleteTorrentsOptions,
  MoveTorrentsOptions,
  SetTorrentsPriorityOptions,
  StartTorrentsOptions,
  StopTorrentsOptions,
} from '@shared/types/Action';

import BaseService from './BaseService';
import fileListPropMap from '../constants/fileListPropMap';
import fileUtil from '../util/fileUtil';
import methodCallUtil from '../util/methodCallUtil';
import scgiUtil from '../util/scgiUtil';

import type {MultiMethodCalls} from './clientRequestManager';

interface ClientGatewayServiceEvents {
  CLIENT_CONNECTION_STATE_CHANGE: () => void;
  PROCESS_TORRENT_LIST_START: () => void;
  PROCESS_TORRENT_LIST_END: (processedTorrentList: {torrents: Torrents}) => void;
  PROCESS_TORRENT: (processedTorrentDetailValues: TorrentProperties) => void;
  PROCESS_TRANSFER_RATE_START: () => void;
}

interface TorrentListReducer<T extends keyof TorrentProperties = keyof TorrentProperties> {
  key: T;
  reduce: (properties: TorrentProperties) => TorrentProperties[T];
}

interface MethodCallConfig {
  methodCalls: Array<string>;
  propLabels: Array<string>;
  valueTransformations: Array<(value: string) => string | number | boolean>;
}

const fileListMethodCallConfig = methodCallUtil.getMethodCallConfigFromPropMap(fileListPropMap, ['pathComponents']);

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
    if (this.services == null || this.services.clientRequestManager == null) {
      return Promise.reject();
    }

    const methodCalls = hashes.reduce((accumulator: MultiMethodCalls, hash) => {
      accumulator.push({
        methodName: 'd.check_hash',
        params: [hash],
      });

      return accumulator;
    }, []);

    return this.services.clientRequestManager
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
    if (this.services == null || this.services.clientRequestManager == null || this.services.torrentService == null) {
      return Promise.reject();
    }

    const resolvedPath = fileUtil.sanitizePath(destination);
    if (!fileUtil.isAllowedPath(resolvedPath)) {
      return Promise.reject(fileUtil.accessDeniedError());
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

    await this.services.clientRequestManager
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

        const destinationFilePath = fileUtil.sanitizePath(path.join(resolvedPath, baseFileName));
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
  removeTorrents({hashes, deleteData}: DeleteTorrentsOptions) {
    if (this.services == null || this.services.clientRequestManager == null) {
      return Promise.reject();
    }

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
          params: [hash, ''].concat(fileListMethodCallConfig.methodCalls),
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

    return this.services.clientRequestManager.methodCall('system.multicall', [methodCalls]).then((response) => {
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
    if (this.services == null || this.services.clientRequestManager == null) {
      return Promise.reject();
    }

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

    return this.services.clientRequestManager
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
    if (this.services == null || this.services.clientRequestManager == null) {
      return Promise.reject();
    }

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

    return this.services.clientRequestManager
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
    if (this.services == null || this.services.clientRequestManager == null) {
      return Promise.reject();
    }

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

    return this.services.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess, this.processClientRequestError);
  }

  /**
   * Sends a multicall request to rTorrent with the requested method calls.
   *
   * @param  {Object} options - An object of options...
   * @param  {Array} options.methodCalls - An array of strings representing
   *   method calls, which the client uses to retrieve details.
   * @param  {Array} options.propLabels - An array of strings that are used as
   *   keys for the transformed torrent details.
   * @param  {Array} options.valueTransformations - An array of functions that
   *   will be called with the values as returned by the client. These return
   *   values will be assigned to the key from the propLabels array.
   * @return {Promise} - Resolves with the processed client response or rejects
   *   with the processed client error.
   */
  fetchTorrentList(options: MethodCallConfig) {
    if (this.services == null) {
      return Promise.reject();
    }

    return this.services.clientRequestManager
      .methodCall('d.multicall2', ['', 'main'].concat(options.methodCalls))
      .then(this.processClientRequestSuccess)
      .then(
        (torrents) => this.processTorrentListResponse(torrents as Array<Array<string>>, options),
        this.processClientRequestError,
      );
  }

  fetchTransferSummary(options: MethodCallConfig) {
    if (this.services == null) {
      return Promise.reject();
    }

    const methodCalls = options.methodCalls.map((methodName) => ({methodName, params: []}));

    return this.services.clientRequestManager
      .methodCall('system.multicall', [methodCalls])
      .then(this.processClientRequestSuccess)
      .then(
        (transferRate) => this.processTransferRateResponse(transferRate as Array<string>, options),
        this.processClientRequestError,
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
   * @param  {Array} response - The array of all torrents and their details.
   * @param  {Object} options - An object of options that instruct us how to
   *   process the client's response.
   * @param  {Array} options.propLabels - An array of strings that map to the
   *   method call. These are the keys of the torrent details.
   * @param  {Array} options.valueTransformations - An array of functions that
   *   transform the detail from the client's response.
   * @return {Object} - An object that represents all torrents with hashes as
   *   keys, each value being an object of detail labels and values.
   */
  processTorrentListResponse(
    torrentList: Array<Array<string>>,
    {propLabels, valueTransformations}: MethodCallConfig,
  ): {id: number; torrents: Torrents} {
    this.emit('PROCESS_TORRENT_LIST_START');

    // We map the array of details to objects with sensibly named keys. We want
    // to return an object with torrent hashes as keys and an object of torrent
    // details as values.
    const processedTorrentList = torrentList.reduce(
      (listAccumulator, torrentDetailValues) => {
        // Transform the array of torrent detail values to an object with
        // sensibly named keys.
        let processedTorrentDetailValues = (torrentDetailValues.reduce(
          (valueAccumulator: Record<string, string | number | boolean>, value: string, valueIndex: number) => {
            const key = propLabels[valueIndex];
            const transformValue = valueTransformations[valueIndex];

            return Object.assign(valueAccumulator, {[key]: transformValue(value)});
          },
          {},
        ) as unknown) as TorrentProperties;

        // Assign values from external reducers to the torrent list object.
        this.torrentListReducers.forEach((reducer) => {
          const {key, reduce} = reducer;

          processedTorrentDetailValues = Object.assign(processedTorrentDetailValues, {
            [key]: reduce(processedTorrentDetailValues),
          });
        });

        this.emit('PROCESS_TORRENT', processedTorrentDetailValues);

        return {
          id: listAccumulator.id,
          torrents: Object.assign(listAccumulator.torrents, {
            [processedTorrentDetailValues.hash]: processedTorrentDetailValues,
          }),
        };
      },
      {id: Date.now(), torrents: {}} as {id: number; torrents: Torrents},
    );

    this.emit('PROCESS_TORRENT_LIST_END', processedTorrentList);

    return processedTorrentList;
  }

  processTransferRateResponse(transferRate: Array<string>, {propLabels, valueTransformations}: MethodCallConfig) {
    this.emit('PROCESS_TRANSFER_RATE_START');

    return (transferRate.reduce((accumulator, value, index) => {
      const key = propLabels[index];
      const transformValue = valueTransformations[index];

      accumulator[key] = transformValue(value);

      return accumulator;
    }, {} as Record<string, unknown>) as unknown) as TransferSummary;
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
