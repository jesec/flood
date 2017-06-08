'use strict';
const EventEmitter = require('events');
const path = require('path');
const rimraf = require('rimraf');

const clientRequestServiceEvents = require('../constants/clientRequestServiceEvents');
const fileListPropMap = require('../constants/fileListPropMap');
const methodCallUtil = require('../util/methodCallUtil');
const scgi = require('../util/scgi');
const torrentListPropMap = require('../constants/torrentListPropMap');

const fileListMethodCallConfig = methodCallUtil.getMethodCallConfigFromPropMap(
  fileListPropMap,
  ['pathComponents']
);

class ClientRequestService extends EventEmitter {
  constructor() {
    super(...arguments);

    this.torrentListReducers = [];
  }

  /**
   * Adds a reducer to be applied when processing the torrent list.
   *
   * @param {Object} reducer - The reducer object
   * @param {string} reducer.key - The key of the reducer, to be applied to the
   *   torrent list object.
   * @param {function} reducer.reduce - The actual reducer. This will recevie
   *   the entire processed torrent list response and it should return it own
   *   processed value, to be assigned to the provided key.
   */
  addTorrentListReducer(reducer = {}) {
    if (typeof reducer.key !== 'string') {
      throw new Error('reducer.key must be a string.');
    }

    if (typeof reducer.reduce !== 'function') {
      throw new Error('reducer.reduce must be a function.');
    }

    this.torrentListReducers.push(reducer);
  }

  removeTorrents(options = {hashes: [], deleteData: false}) {
    const methodCalls = options.hashes.reduce(
      (accumulator, hash, index) => {
        let eraseFileMethodCallIndex = index;

        // If we're deleting files, we grab each torrents' file list before we
        // remove them.
        if (options.deleteData) {
          // We offset the indices of these method calls so that we know exactly
          // where to retrieve them in the future.
          const directoryBaseMethodCallIndex = index + options.hashes.length;
          eraseFileMethodCallIndex = index + options.hashes.length * 2;

          accumulator[index] = {
            methodName: 'f.multicall',
            params: [hash, ''].concat(fileListMethodCallConfig.methodCalls)
          };

          accumulator[directoryBaseMethodCallIndex] = {
            methodName: 'd.directory_base',
            params: [hash]
          };
        }

        accumulator[eraseFileMethodCallIndex] = {
          methodName: 'd.erase',
          params: [hash]
        };

        return accumulator;
      },
      []
    );

    return scgi
      .methodCall('system.multicall', [methodCalls])
      .then((response) => {
        if (options.deleteData) {
          const torrentCount = options.hashes.length;
          const filesToDelete = options.hashes.reduce(
            (accumulator, hash, hashIndex) => {
              const fileList = response[hashIndex][0];
              const directoryBase = response[hashIndex + torrentCount][0];

              const filesToDelete = fileList.reduce(
                (fileListAccumulator, file) => {
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
                },
                []
              );

              return accumulator.concat(filesToDelete);
            },
            []
          );

          filesToDelete.forEach(file => {
            rimraf(file, {disableGlob: true}, error => {
              if (error) {
                console.error(`Error deleting file: ${file}\n${error}`);
              }
            });
          });
        }

        this.emit(clientRequestServiceEvents.TORRENTS_REMOVED, options);

        return response;
      })
      .catch(clientError => this.processClientError(clientError));
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
  fetchTorrentList(options) {
    return scgi
      .methodCall('d.multicall2', ['', 'main'].concat(options.methodCalls))
      .then(torrents => this.processTorrentListResponse(torrents, options))
      .catch(clientError => this.processClientError(clientError));
  }

  fetchTransferSummary(options) {
    const methodCalls = options.methodCalls.map(methodName => {
      return {methodName, params: []};
    });

    return scgi
      .methodCall('system.multicall', [methodCalls])
      .then(transferRate => {
        return this.processTransferRateResponse(transferRate, options);
      })
      .catch(clientError => {
        return this.processClientError(clientError);
      });
  }

  processClientError(error) {
    return error;
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
  processTorrentListResponse(torrentList, options) {
    this.emit(clientRequestServiceEvents.PROCESS_TORRENT_LIST_START);

    // We map the array of details to objects with sensibly named keys. We want
    // to return an object with torrent hashes as keys and an object of torrent
    // details as values.
    const processedTorrentList = torrentList.reduce(
      (listAccumulator, torrentDetailValues) => {
        // Transform the array of torrent detail values to an object with
        // sensibly named keys.
        const processedTorrentDetailValues = torrentDetailValues.reduce(
          (valueAccumulator, value, valueIndex) => {
            const key = options.propLabels[valueIndex];
            const transformValue = options.valueTransformations[valueIndex];

            valueAccumulator[key] = transformValue(value);
            return valueAccumulator;
          },
          {}
        );

        // Assign values from external reducers to the torrent list object.
        this.torrentListReducers.forEach(reducer => {
          const {key, reduce} = reducer;

          processedTorrentDetailValues[key] = reduce(
            processedTorrentDetailValues
          );
        });

        listAccumulator.torrents[processedTorrentDetailValues.hash] =
          processedTorrentDetailValues;

        this.emit(
          clientRequestServiceEvents.PROCESS_TORRENT,
          processedTorrentDetailValues
        );

        return listAccumulator;
      },
      {torrents: {}}
    );

    // Provide the number of torrents.
    processedTorrentList.length = torrentList.length;
    // Provide a unique ID for this specific torrent list.
    processedTorrentList.id = Date.now();

    this.emit(
      clientRequestServiceEvents.PROCESS_TORRENT_LIST_END,
      processedTorrentList
    );

    return processedTorrentList;
  }

  processTransferRateResponse(transferRate = [], options) {
    this.emit(clientRequestServiceEvents.PROCESS_TRANSFER_RATE_START);

    return transferRate.reduce(
      (accumulator, value, index) => {
        const key = options.propLabels[index];
        const transformValue = options.valueTransformations[index];

        accumulator[key] = transformValue(value);

        return accumulator;
      },
      {}
    );
  }
}

module.exports = new ClientRequestService();
