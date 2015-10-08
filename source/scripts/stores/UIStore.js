let AppDispatcher = require('../dispatcher/AppDispatcher');
let EventEmitter = require('events').EventEmitter;
let TorrentConstants = require('../constants/TorrentConstants');
let UIConstants = require('../constants/UIConstants');
let assign = require('object-assign');

let _activeModal = null;
let _selectedTorrents = [];
let _torrentCount = 0;
let _torrentHeight = 68;
let _viewportHeight = 200;
let _minTorrentRendered = 0;
let _maxTorrentRendered = 10;
let _torrentRenderBuffer = 2;
let _spaceTop = 0;
let _spaceBottom = 0;

let UIStore = assign({}, EventEmitter.prototype, {

    getActiveModal: function() {

        return _activeModal;
    },

    getSelectedTorrents: function() {

        return _selectedTorrents;
    },

    getMinTorrentRendered: function() {

        return _minTorrentRendered;
    },

    getMaxTorrentRendered: function() {

        return _maxTorrentRendered;
    },

    getSpaceTop: function(hiddenTorrents) {

        return _spaceTop;
    },

    getSpaceBottom: function(hiddenTorrents) {

        return _spaceBottom;
    },

    emitSelectionChange: function() {
        this.emit(TorrentConstants.TORRENT_SELECTION_CHANGE);
    },

    emitViewportPaddingChange: function() {
        this.emit(UIConstants.TORRENT_LIST_PADDING_CHANGE);
    },

    emitModalChange: function() {
        this.emit(UIConstants.TORRENT_ADD_MODAL_TOGGLE_CHANGE);
    },

    addSelectionChangeListener: function(callback) {
        this.on(TorrentConstants.TORRENT_SELECTION_CHANGE, callback);
    },

    addViewportPaddingChangeListener: function(callback) {
        this.on(UIConstants.TORRENT_LIST_PADDING_CHANGE, callback);
    },

    addModalChangeListener: function(callback) {
        this.on(UIConstants.TORRENT_ADD_MODAL_TOGGLE_CHANGE, callback);
    },

    removeSelectionChangeListener: function(callback) {
        this.removeListener(TorrentConstants.TORRENT_SELECTION_CHANGE, callback);
    },

    removeViewportPaddingChangeListener: function(callback) {
        this.removeListener(UIConstants.TORRENT_LIST_PADDING_CHANGE, callback);
    },

    removeModalChangeListener: function(callback) {
        this.removeListener(UIConstants.TORRENT_ADD_MODAL_TOGGLE_CHANGE, callback);
    },

});

let dispatcherIndex = AppDispatcher.register(function(action) {

    let text;

    switch(action.actionType) {

        case TorrentConstants.TORRENT_CLICK:
            let hash = action.hash;
            let hashLocation = _selectedTorrents.indexOf(hash);
            let isSelected = hashLocation > -1;

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

            UIStore.emitSelectionChange();
            break;

        case UIConstants.TORRENT_LIST_SCROLL:
            // debounce this event
            setRenderLimit(event.target.scrollTop, action.torrentCount);
            UIStore.emitViewportPaddingChange();
            break;

        case UIConstants.TORRENT_LIST_VIEWPORT_RESIZE:
            // debounce this event
            setViewportHeight(action.viewportHeight);
            UIStore.emitViewportPaddingChange();
            break;

        case UIConstants.TORRENT_ADD_MODAL_TOGGLE:
            if (_activeModal !== 'torrent-add') {
                _activeModal = 'torrent-add';
            } else {
                _activeModal = null;
            }
            UIStore.emitModalChange();
            break;

        case UIConstants.MODALS_DISMISS:
            _activeModal = null;
            UIStore.emitModalChange();
            break;

    }
});

let setViewportHeight = function(height) {
    _viewportHeight = height;
}

let getSpacer = function(torrents) {

    let spacerHeight = 0;

    if (torrents > 0) {
        spacerHeight = torrents * _torrentHeight;
    }

    return spacerHeight;
}

let setRenderLimit = function(scrollPosition, torrentCount) {

    let elementsInView = Math.floor(_viewportHeight / _torrentHeight);

    _minTorrentRendered = Math.floor(scrollPosition / _torrentHeight) - _torrentRenderBuffer;
    _maxTorrentRendered = _minTorrentRendered + elementsInView + (_torrentRenderBuffer * 2);

    _spaceTop = getSpacer(_minTorrentRendered);
    _spaceBottom = getSpacer(torrentCount - 1 - _maxTorrentRendered);
}

module.exports = UIStore;
