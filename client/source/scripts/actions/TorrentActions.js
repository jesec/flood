import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';

const TorrentActions = {
  addTorrentsByUrls: (urls, destination) => {
    axios.post('/ui/torrent-location', {
        destination
      })
      .catch((error) => {
        console.log(error);
      });
    return axios.post('/client/add', {
        urls,
        destination
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((response) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_ADD_TORRENT_SUCCESS,
          data: {
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
    axios.post('/ui/torrent-location', {
        destination
      })
      .catch((error) => {
        console.log(error);
      });
    return axios.post('/client/add-files', filesData)
      .then((json = {}) => {
        return json.data;
      })
      .then((response) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_ADD_TORRENT_SUCCESS,
          data: {
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

  deleteTorrents: (hash) => {
    return axios.post('/client/torrents/delete', {hash})
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_REMOVE_TORRENT_SUCCESS,
          data
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_REMOVE_TORRENT_ERROR,
          error
        });
      });
  },

  fetchLatestTorrentLocation: () => {
    return axios.get('/ui/torrent-location')
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.UI_LATEST_TORRENT_LOCATION_REQUEST_SUCCESS,
          data
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.UI_LATEST_TORRENT_LOCATION_REQUEST_ERROR,
          error
        });
      });
  },

  fetchTorrents: () => {
    return axios.get('/client/torrents')
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
        console.log(error);
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TORRENTS_ERROR,
          data: {
            error
          }
        });
      });
  },

  fetchTorrentDetails: (hash) => {
    return axios.post('/client/torrent-details', {
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

  fetchTorrentStatusCount: () => {
    return axios.get('/client/torrents/status-count')
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
    return axios.get('/client/torrents/tracker-count')
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

    return axios.post('/client/torrents/move',
      {hashes, destination, filenames, sources, moveFiles})
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_MOVE_TORRENTS_SUCCESS,
          data
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
    return axios.post('/client/pause', {
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
    return axios.post('/client/start', {
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
    return axios.post('/client/stop', {
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
    return axios.patch(`/client/torrents/${hash}/priority`, {
        hash,
        priority
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_SET_FILE_PRIORITY_SUCCESS,
          data
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_SET_FILE_PRIORITY_ERROR,
          error
        });
      });
  },

  setFilePriority: (hash, fileIndices, priority) => {
    return axios.patch(`/client/torrents/${hash}/file-priority`, {
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
          data
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_SET_FILE_PRIORITY_ERROR,
          error
        });
      });
  }
};

export default TorrentActions;
