var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var TorrentConstants = require('../constants/TorrentConstants');
var UIConstants = require('../constants/UIConstants');
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

    getSortCriteria: function() {

        if (_sorted) {
            return _sortCriteria;
        } else {
            return false;
        }
    },

    emitChange: function() {
        this.emit(TorrentConstants.TORRENT_LIST_CHANGE);
    },

    emitSortChange: function() {
        this.emit(UIConstants.FILTER_SORT_CHANGE);
    },

    addChangeListener: function(callback) {
        this.on(TorrentConstants.TORRENT_LIST_CHANGE, callback);
    },

    addSortChangeListener: function(callback) {
        this.on(UIConstants.FILTER_SORT_CHANGE, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(TorrentConstants.TORRENT_LIST_CHANGE, callback);
    },

    removeSortChangeListener: function(callback) {
        this.removeListener(UIConstants.FILTER_SORT_CHANGE, callback);
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

        case UIConstants.FILTER_SORT_CHANGE:
            _sortCriteria.property = action.property;
            _sortCriteria.direction = action.direction;
            sortTorrentList();
            TorrentStore.emitSortChange();
            TorrentStore.emitChange();
            break;

        case TorrentConstants.FILTER_SEARCH_CHANGE:
            console.log(action);
            TorrentStore.emitChange();
            break;

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

        var valA = a[property];
        var valB = b[property];

        if (property === 'eta') {

            // keep infinity at bottom of array when sorting by eta
            if (valA === 'Infinity' && valB !== 'Infinity') {
                return 1;
            } else if (valA !== 'Infinity' && valB === 'Infinity') {
                return -1;
            }

            // if it's not infinity, compare the second as numbers
            if (valA !== 'Infinity') {
                valA = Number(valA.seconds);
            }

            if (valB !== 'Infinity') {
                valB = Number(valB.seconds);
            }

        } else if (property === 'name') {

            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        } else {

            valA = Number(valA);
            valB = Number(valB);
        }

        if (direction === 'asc') {

            if (valA > valB) {
                return 1;
            }

            if (valA < valB) {
                return -1;
            }

        } else {

            if (valA > valB) {
                return -1;
            }

            if (valA < valB) {
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
