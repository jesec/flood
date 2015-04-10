var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var TorrentConstants = require('../constants/TorrentConstants');
var assign = require('object-assign');

var _selectedTorrents = [];

var UIStore = assign({}, EventEmitter.prototype, {

    getSelectedTorrents: function() {
        return _selectedTorrents;
    },

    emitChange: function() {
        this.emit(TorrentConstants.TORRENT_SELECT_CHANGE);
    },

    addChangeListener: function(callback) {
        this.on(TorrentConstants.TORRENT_SELECT_CHANGE, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(TorrentConstants.TORRENT_SELECT_CHANGE, callback);
    }

});

var dispatcherIndex = AppDispatcher.register(function(action) {

    var text;

    switch(action.actionType) {

        case TorrentConstants.TORRENT_CLICK:
            var hash = action.hash;
            var hashLocation = _selectedTorrents.indexOf(hash);
            var isSelected = hashLocation > -1;

            if (!event.metaKey && !event.shiftKey && !event.ctrlKey) {
                // if command, shift, and control are not pressed, clear other selected torrents
                _selectedTorrents = [hash];
            } else if ((event.metaKey || event.ctrlKey) && !event.shiftKey) {
                // if command or control are pressed, but shift is not, then see
                // if it's already selected. if so, remove it. if not, add it
                if (isSelected) {
                    _selectedTorrents.splice(hashLocation, 1);
                } else {
                    _selectedTorrents.push(hash);
                }
            }

            UIStore.emitChange();

        default:
            // nothing

    }
});

module.exports = UIStore;
