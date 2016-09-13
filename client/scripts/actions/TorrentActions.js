import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';

let TorrentActions = {
  addTorrentsByUrls: (options) => {
    return axios.post('/api/client/add', options)
      .then((json = {}) => {
        return json.data;
      })
      .then((response) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_ADD_TORRENT_SUCCESS,
          data: {
            count: options.urls.length,
            destination: options.destination,
            response
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_ADD_TORRENT_ERROR,
          data: {
            error
          }
        });
      });
  },

  addTorrentsByFiles: (filesData, destination) => {
    return axios.post('/api/client/add-files', filesData)
      .then((json = {}) => {
        return json.data;
      })
      .then((response) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_ADD_TORRENT_SUCCESS,
          data: {
            count: filesData.getAll('torrents').length,
            destination,
            response
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_ADD_TORRENT_ERROR,
          data: {
            error
          }
        });
      });
  },

  deleteTorrents: (hash, deleteData) => {
    return axios.post('/api/client/torrents/delete', {hash, deleteData})
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_REMOVE_TORRENT_SUCCESS,
          data: {
            data,
            count: hash.length,
            deleteData
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_REMOVE_TORRENT_ERROR,
          error: {
            error,
            count: hash.length
          }
        });
      });
  },

  checkHash: (hash) => {
    return axios.post('/api/client/torrents/check-hash', {hash})
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_CHECK_HASH_SUCCESS,
          data: {
            data,
            count: hash.length
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_CHECK_HASH_ERROR,
          error: {
            error,
            count: hash.length
          }
        });
      });
  },

  fetchTorrents: () => {
    return axios.get('/api/client/torrents')
      .then((json = {}) => {
        return json.data;
      })
      .then((torrents) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TORRENTS_SUCCESS,
          data: {
            torrents
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TORRENTS_ERROR,
          data: {
            error
          }
        });
      });
  },

  fetchTorrentDetails: (hash) => {
    return axios.post('/api/client/torrent-details', {
        hash
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((torrentDetails) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TORRENT_DETAILS_SUCCESS,
          data: {
            hash,
            torrentDetails
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TORRENT_DETAILS_ERROR,
          data: {
            hash
          }
        });
      });
  },

  fetchTorrentTaxonomy: () => {
    return axios.get('/api/client/torrents/taxonomy')
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS,
          data
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TORRENT_TAXONOMY_ERROR,
          error
        });
      });
  },

  fetchTorrentStatusCount: () => {
    return axios.get('/api/client/torrents/status-count')
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TORRENT_STATUS_COUNT_REQUEST_SUCCESS,
          data
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TORRENT_STATUS_COUNT_REQUEST_ERROR,
          error
        });
      });
  },

  fetchTorrentTrackerCount: () => {
    return axios.get('/api/client/torrents/tracker-count')
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TORRENT_TRACKER_COUNT_REQUEST_SUCCESS,
          data
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TORRENT_TRACKER_COUNT_REQUEST_ERROR,
          error
        });
      });
  },

  moveTorrents: (hashes, options) => {
    let {destination, filenames, sources, moveFiles} = options;

    return axios.post('/api/client/torrents/move',
      {hashes, destination, filenames, sources, moveFiles})
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_MOVE_TORRENTS_SUCCESS,
          data: {
            data,
            count: hashes.length
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_MOVE_TORRENTS_ERROR,
          error
        });
      });
  },

  pauseTorrents: (hashes) => {
    return axios.post('/api/client/pause', {
        hashes
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((response) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_START_TORRENT_SUCCESS,
          data: {
            response
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_START_TORRENT_ERROR,
          data: {
            error
          }
        });
      });
  },

  startTorrents: (hashes) => {
    return axios.post('/api/client/start', {
        hashes
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((response) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_START_TORRENT_SUCCESS,
          data: {
            response
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_START_TORRENT_ERROR,
          data: {
            error
          }
        });
      });
  },

  stopTorrents: (hashes) => {
    return axios.post('/api/client/stop', {
        hashes
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((response) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_STOP_TORRENT_SUCCESS,
          data: {
            response
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_STOP_TORRENT_ERROR,
          data: {
            error
          }
        });
      });
  },

  setPriority: (hash, priority) => {
    return axios.patch(`/api/client/torrents/${hash}/priority`, {
        hash,
        priority
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_SET_TORRENT_PRIORITY_SUCCESS,
          data
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_SET_TORRENT_PRIORITY_ERROR,
          error
        });
      });
  },

  setFilePriority: (hash, fileIndices, priority) => {
    return axios.patch(`/api/client/torrents/${hash}/file-priority`, {
        hash,
        fileIndices,
        priority
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_SET_FILE_PRIORITY_SUCCESS,
          data: {
            ...data,
            hash,
            fileIndices,
            priority
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_SET_FILE_PRIORITY_ERROR,
          error
        });
      });
  },

  setTaxonomy: (hashes, tags, options = {}) => {
    return axios.patch(`/api/client/torrents/taxonomy`, {
        hashes,
        tags,
        options
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_SET_TAXONOMY_SUCCESS,
          data
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_SET_TAXONOMY_ERROR,
          error
        });
      });
  },
};

export default TorrentActions;
