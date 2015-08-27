var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ClientConstants = require('../constants/ClientConstants');
var $ = require('jquery');
var assign = require('object-assign');

var _historyLength = 20;
var _stats = {};
var _uploadSpeedHistory = [];
var _downloadSpeedHistory = [];

var ClientStore = assign({}, EventEmitter.prototype, {
  getStats: function() {
    return _stats;
  },

  emitChange: function() {
    this.emit(ClientConstants.CLIENT_STATS_CHANGE);
  },

  addChangeListener: function(callback) {
    this.on(ClientConstants.CLIENT_STATS_CHANGE, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(ClientConstants.CLIENT_STATS_CHANGE, callback);
  }
});

var dispatcherIndex = AppDispatcher.register(function(action) {
  var text;

  switch(action.actionType) {

    case ClientConstants.ADD_TORRENT:
      getClientStats();
      break;

    case ClientConstants.REMOVE_TORRENT:
      getClientStats();
      break;
  }
});

var addHistory = function(uploadSpeed, downloadSpeed) {
  var index = 0;

  console.log(uploadSpeed, downloadSpeed);

  while (index < _historyLength) {
    if (index < _historyLength - 1) {
      if (_uploadSpeedHistory[index] != null && _uploadSpeedHistory[index].x != null) {
        _uploadSpeedHistory[index].y = _uploadSpeedHistory[index + 1].y;
        _downloadSpeedHistory[index].y = _downloadSpeedHistory[index + 1].y;
      } else {
        _uploadSpeedHistory[index] = {
          x: index,
          y: 0
        }
        _downloadSpeedHistory[index] = {
          x: index,
          y: 0
        }
      }
    } else {
      _uploadSpeedHistory[index] = {
        x: index,
        y: uploadSpeed
      }
      _downloadSpeedHistory[index] = {
        x: index,
        y: downloadSpeed
      }
    }

    index++;
  }
}

var getClientStats = function(callback) {
  $.ajax({
    url: '/client/stats',
    dataType: 'json',

    success: function(data) {
      addHistory(data.uploadRate, data.downloadRate);

      _stats = {
        currentSpeed: {
          upload: data.uploadRate,
          download: data.downloadRate
        },
        historicalSpeed: {
          upload: _uploadSpeedHistory,
          download: _downloadSpeedHistory
        },
        transferred: {
          upload: data.uploadTotal,
          download: data.downloadTotal
        }
      };

      ClientStore.emitChange();

    }.bind(this),

    error: function(xhr, status, err) {
      console.error('/client/stats', status, err.toString());
    }.bind(this)
  });

};

getClientStats();
setInterval(getClientStats, 5000);

module.exports = ClientStore;
