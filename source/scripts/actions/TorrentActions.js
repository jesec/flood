var AppDispatcher = require('../dispatcher/AppDispatcher');
var TorrentConstants = require('../constants/TorrentConstants');

var $ = require('jquery');

var clientRequest = function(action, data) {
  return $.ajax({
    data: JSON.stringify(data),
    contentType: 'application/json; charset=utf-8',
    type: 'POST',
    url: action
  });
};

var TorrentActions = {
  add: function(data) {
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

  click: function(hash) {
    AppDispatcher.dispatch({
      actionType: TorrentConstants.TORRENT_CLICK,
      hash: hash
    });
  },

  start: function(data) {
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

  stop: function(data) {
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

module.exports = TorrentActions;
