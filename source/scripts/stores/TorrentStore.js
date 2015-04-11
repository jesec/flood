var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var TorrentConstants = require('../constants/TorrentConstants');
var $ = require('jquery');
var assign = require('object-assign');

var _torrents = {};

var getTorrentList = function(callback) {

    $.ajax({
        url: '/torrents/list',
        dataType: 'json',

        success: function(data) {
            _torrents = data;
            TorrentStore.emitChange();
        }.bind(this),

        error: function(xhr, status, err) {
            console.error('/torrents/list', status, err.toString());
        }.bind(this)
    });

};

getTorrentList();
setInterval(getTorrentList, 5000);

var TorrentStore = assign({}, EventEmitter.prototype, {

    getAll: function() {
        return _torrents;
    },

    emitChange: function() {
        this.emit(TorrentConstants.TORRENT_LIST_CHANGE);
    },

    addChangeListener: function(callback) {
        this.on(TorrentConstants.TORRENT_LIST_CHANGE, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(TorrentConstants.TORRENT_LIST_CHANGE, callback);
    }

});

var dispatcherIndex = AppDispatcher.register(function(action) {

    var text;

    switch(action.actionType) {

        case TorrentConstants.TORRENT_STOP:
            getTorrentList();
            break;

        case TorrentConstants.TORRENT_START:
            getTorrentList();
            break;

        default:
            // nothing

    }
});

module.exports = TorrentStore;
