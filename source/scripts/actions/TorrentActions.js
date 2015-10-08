import $ from 'jquery';

import AppDispatcher from '../dispatcher/AppDispatcher';
import TorrentConstants from '../constants/TorrentConstants';

let clientRequest = function(action, data) {
  return $.ajax({
    data: JSON.stringify(data),
    contentType: 'application/json; charset=utf-8',
    type: 'POST',
    url: action
  });
};

const TorrentActions = {

  add(data) {
    clientRequest('/torrents/add', data)
      .done(function(response) {
        AppDispatcher.dispatch({
          actionType: TorrentConstants.TORRENT_ADD_SUCCESS,
          data: response
        });
      })
      .fail(function(response) {
        AppDispatcher.dispatch({
          actionType: TorrentConstants.TORRENT_ADD_FAIL,
          data: response
        });
      });
  },

  click(hash) {
    AppDispatcher.dispatch({
      actionType: TorrentConstants.TORRENT_CLICK,
      hash: hash
    });
  },

  start(data) {
    clientRequest('/torrents/start', data)
      .done(function(response) {
        AppDispatcher.dispatch({
          actionType: TorrentConstants.TORRENT_START_SUCCESS,
          data: response
        });
      })
      .fail(function(response) {
        AppDispatcher.dispatch({
          actionType: TorrentConstants.TORRENT_START_FAIL,
          data: response
        });
      });
  },

  stop(data) {
    clientRequest('/torrents/stop', data)
      .done(function(response) {
        AppDispatcher.dispatch({
          actionType: TorrentConstants.TORRENT_STOP_SUCCESS,
          data: response
        });
      })
      .fail(function(response) {
        AppDispatcher.dispatch({
          actionType: TorrentConstants.TORRENT_STOP_FAIL,
          data: response
        });
      });
  }

};

export default TorrentActions;
