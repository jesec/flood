var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var TorrentConstants = require('../constants/TorrentConstants');
var $ = require('jquery');
var assign = require('object-assign');

var _torrents = [];

var _sortedTorrents = [];
var _sorted = true;
var _sortCriteria = {
    property: 'name',
    direction: 'asc'
}

var TorrentStore = assign({}, EventEmitter.prototype, {

    getAll: function() {

        if (_sorted) {
            return _sortedTorrents;
        } else {
            return _torrents;
        }

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

        case TorrentConstants.FILTER_SORT_CHANGE:
            console.log('heard sort change');
            console.log(action);
            TorrentStore.emitChange();

        case TorrentConstants.FILTER_SEARCH_CHANGE:
            _sortCriteria.property = action.property;
            _sortCriteria.direction = action.direction;
            sortTorrentList();
            TorrentStore.emitChange();

        default:
            // nothing

    }
});

var getTorrentList = function(callback) {

    $.ajax({
        url: '/torrents/list',
        dataType: 'json',

        success: function(data) {

            _torrents = data;

            if (_sorted) {
                _sortedTorrents = sortTorrentList();
            }

            TorrentStore.emitChange();
        }.bind(this),

        error: function(xhr, status, err) {
            console.error('/torrents/list', status, err.toString());
        }.bind(this)
    });

};

var sortTorrentList = function() {

    var property = _sortCriteria.property;
    var direction = _sortCriteria.direction;

    var sortedList = _torrents.sort(function(a, b) {

        var propA = a[property];
        var propB = b[property];

        if (property === 'name') {
            propA = propA.toLowerCase();
            propB = propB.toLowerCase();
        } else {
            propA = Number(propA);
            propB = Number(propB);
        }

        if (direction === 'asc') {

            if (propA > propB) {
                return 1;
            }

            if (propA < propB) {
                return -1;
            }

        } else {

            if (propA > propB) {
                return -1;
            }

            if (propA < propB) {
                return 1;
            }

        }

        return 0;
    });

    return sortedList;
};

getTorrentList();
setInterval(getTorrentList, 5000);

module.exports = TorrentStore;
