import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';

const TorrentActions = {
  addTorrents: function(urls, destination) {
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

  fetchTorrents: function () {
    return axios.get('/client/list')
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

  fetchTorrentDetails: function(hash) {
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

  startTorrents: function(hashes) {
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

  stopTorrents: function(hashes) {
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
  }
};

export default TorrentActions;
