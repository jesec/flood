import $ from 'jquery';
import assign from 'object-assign';
import {EventEmitter} from 'events';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ClientConstants from '../constants/ClientConstants';

let _historyLength = 20;
let _stats = {};
let _uploadSpeedHistory = [];
let _downloadSpeedHistory = [];

let ClientStore = assign({}, EventEmitter.prototype, {
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

let dispatcherIndex = AppDispatcher.register(function(action) {
  let text;

  switch(action.actionType) {

    case ClientConstants.ADD_TORRENT:
      getClientStats();
      break;

    case ClientConstants.REMOVE_TORRENT:
      getClientStats();
      break;
  }
});

let addHistory = function(uploadSpeed, downloadSpeed) {
  let index = 0;

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

let getClientStats = function(callback) {
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

export default ClientStore;
