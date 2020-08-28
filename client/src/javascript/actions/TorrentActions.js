import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import ConfigStore from '../stores/ConfigStore';

const baseURI = ConfigStore.getBaseURI();

const TorrentActions = {
  addTorrentsByUrls: (options) =>
    axios
      .post(`${baseURI}api/client/add`, options)
      .then((json = {}) => json.data)
      .then(
        (response) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_ADD_TORRENT_SUCCESS,
            data: {
              count: options.urls.length,
              destination: options.destination,
              response,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_ADD_TORRENT_ERROR,
            data: {
              error,
            },
          });
        },
      ),

  addTorrentsByFiles: (formData, destination) =>
    axios
      .post(`${baseURI}api/client/add-files`, formData)
      .then((json = {}) => json.data)
      .then(
        (response) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_ADD_TORRENT_SUCCESS,
            data: {
              count: formData.getAll('torrents').length,
              destination,
              response,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_ADD_TORRENT_ERROR,
            data: {
              error,
            },
          });
        },
      ),

  deleteTorrents: (hash, deleteData) =>
    axios
      .post(`${baseURI}api/client/torrents/delete`, {hash, deleteData})
      .then((json = {}) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_REMOVE_TORRENT_SUCCESS,
            data: {
              data,
              count: hash.length,
              deleteData,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_REMOVE_TORRENT_ERROR,
            error: {
              error,
              count: hash.length,
            },
          });
        },
      ),

  checkHash: (hash) =>
    axios
      .post(`${baseURI}api/client/torrents/check-hash`, {hash})
      .then((json = {}) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_CHECK_HASH_SUCCESS,
            data: {
              data,
              count: hash.length,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_CHECK_HASH_ERROR,
            error: {
              error,
              count: hash.length,
            },
          });
        },
      ),

  fetchTorrentDetails: (hash) =>
    axios
      .post(`${baseURI}api/client/torrent-details`, {
        hash,
      })
      .then((json = {}) => json.data)
      .then(
        (torrentDetails) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_FETCH_TORRENT_DETAILS_SUCCESS,
            data: {
              hash,
              torrentDetails,
            },
          });
        },
        () => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_FETCH_TORRENT_DETAILS_ERROR,
            data: {
              hash,
            },
          });
        },
      ),

  moveTorrents: (hashes, options) => {
    const {destination, isBasePath, filenames, sourcePaths, moveFiles, isCheckHash} = options;

    return axios
      .post(`${baseURI}api/client/torrents/move`, {
        hashes,
        destination,
        isBasePath,
        filenames,
        sourcePaths,
        moveFiles,
        isCheckHash,
      })
      .then((json = {}) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_MOVE_TORRENTS_SUCCESS,
            data: {
              data,
              count: hashes.length,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_MOVE_TORRENTS_ERROR,
            error,
          });
        },
      );
  },

  startTorrents: (hashes) =>
    axios
      .post(`${baseURI}api/client/start`, {
        hashes,
      })
      .then((json = {}) => json.data)
      .then(
        (response) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_START_TORRENT_SUCCESS,
            data: {
              response,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_START_TORRENT_ERROR,
            data: {
              error,
            },
          });
        },
      ),

  stopTorrents: (hashes) =>
    axios
      .post(`${baseURI}api/client/stop`, {
        hashes,
      })
      .then((json = {}) => json.data)
      .then(
        (response) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_STOP_TORRENT_SUCCESS,
            data: {
              response,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_STOP_TORRENT_ERROR,
            data: {
              error,
            },
          });
        },
      ),

  setPriority: (hash, priority) =>
    axios
      .patch(`${baseURI}api/client/torrents/${hash}/priority`, {
        hash,
        priority,
      })
      .then((json = {}) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_SET_TORRENT_PRIORITY_SUCCESS,
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_SET_TORRENT_PRIORITY_ERROR,
            error,
          });
        },
      ),

  setFilePriority: (hash, fileIndices, priority) =>
    axios
      .patch(`${baseURI}api/client/torrents/${hash}/file-priority`, {
        hash,
        fileIndices,
        priority,
      })
      .then((json = {}) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_SET_FILE_PRIORITY_SUCCESS,
            data: {
              ...data,
              hash,
              fileIndices,
              priority,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_SET_FILE_PRIORITY_ERROR,
            error,
          });
        },
      ),

  setTaxonomy: (hashes, tags, options = {}) =>
    axios
      .patch(`${baseURI}api/client/torrents/taxonomy`, {
        hashes,
        tags,
        options,
      })
      .then((json = {}) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_SET_TAXONOMY_SUCCESS,
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_SET_TAXONOMY_ERROR,
            error,
          });
        },
      ),

  setTracker: (hashes, tracker, options = {}) =>
    axios
      .patch(`${baseURI}api/client/torrents/tracker`, {
        hashes,
        tracker,
        options,
      })
      .then((json = {}) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_SET_TRACKER_SUCCESS,
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.CLIENT_SET_TRACKER_ERROR,
            error,
          });
        },
      ),
};

export default TorrentActions;
