import assign from 'object-assign';
import {EventEmitter} from 'events';

import AppDispatcher from '../dispatcher/AppDispatcher';
import TorrentConstants from '../constants/TorrentConstants';
import UIConstants from '../constants/UIConstants';

let _activeModal = null;
let _selectedTorrents = [];
let _torrentCount = 0;
let _torrentHeight = 64;
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

  emitSelectionChange: function() {
    this.emit(TorrentConstants.TORRENT_SELECTION_CHANGE);
  },

  emitModalChange: function() {
    this.emit(UIConstants.TORRENT_ADD_MODAL_TOGGLE_CHANGE);
  },

  addSelectionChangeListener: function(callback) {
    this.on(TorrentConstants.TORRENT_SELECTION_CHANGE, callback);
  },

  addModalChangeListener: function(callback) {
    this.on(UIConstants.TORRENT_ADD_MODAL_TOGGLE_CHANGE, callback);
  },

  removeSelectionChangeListener: function(callback) {
    this.removeListener(TorrentConstants.TORRENT_SELECTION_CHANGE, callback);
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

module.exports = UIStore;
