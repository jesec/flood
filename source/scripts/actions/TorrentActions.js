var AppDispatcher = require('../dispatcher/AppDispatcher');
var TorrentConstants = require('../constants/TorrentConstants');
var $ = require('jquery');

var performAction = function(action, hash, success, error) {
  $.ajax({
    url: '/torrents/' + hash + '/' + action,
    dataType: 'json',

    success: function(data) {
      success(data);
    }.bind(this),

    error: function(xhr, status, err) {
      console.error(torrentsData, status, err.toString());
    }.bind(this)
  });

};

var add = function(data) {
  $.ajax({
    data: data,
    dataType: 'json',
    type: 'POST',
    url: '/torrents/add',

    success: function(data) {
      success(data);
    }.bind(this),

    error: function(xhr, status, err) {
      console.error(torrentsData, status, err.toString());
    }.bind(this)
  });
};

var TorrentActions = {
  add: function(data) {
    add(data, function(data) {
      AppDispatcher.dispatch({
        actionType: TorrentConstants.TORRENT_ADD_URL,
        data: data
      });
    });
  },

  click: function(hash) {
    AppDispatcher.dispatch({
      actionType: TorrentConstants.TORRENT_CLICK,
      hash: hash
    });
  },

  start: function(hash) {
    performAction('start', hash, function(data) {
      AppDispatcher.dispatch({
        actionType: TorrentConstants.TORRENT_START
      });
    });
  },

  stop: function(hash) {
    performAction('stop', hash, function(data) {
      AppDispatcher.dispatch({
        actionType: TorrentConstants.TORRENT_STOP
      });
    });
  }
};

module.exports = TorrentActions;
