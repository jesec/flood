import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';
import {selectTorrents} from '../util/selectTorrents';
import TorrentActions from '../actions/TorrentActions';

class UIStoreClass extends BaseStore {
  constructor() {
    super();

    this.activeModal = null;
    this.torrentDetailsHash = null;
    this.torrentDetailsOpen = false;
  }

  closeTorrentDetailsPanel() {
    if (this.torrentDetailsOpen) {
      this.torrentDetailsOpen = false;
      this.emit(EventTypes.UI_TORRENT_DETAILS_OPEN_CHANGE);
    }
  }

  getActiveModal() {
    return this.activeModal;
  }

  setActiveModal(modal) {
    this.activeModal = modal;
    this.emit(EventTypes.UI_MODAL_CHANGE);
  }

  getTorrentDetailsHash() {
    return this.torrentDetailsHash;
  }

  handleTorrentClick(hash) {
    console.log('set torrent details hash');
    this.torrentDetailsHash = hash;
    this.emit(EventTypes.UI_TORRENT_DETAILS_HASH_CHANGE);
  }

  handleTorrentDetailsClick(hash, event) {
    console.log(hash);
    console.log(this.torrentDetailsHash);
    this.torrentDetailsOpen = !this.torrentDetailsOpen;
    this.emit(EventTypes.UI_TORRENT_DETAILS_OPEN_CHANGE);
  }

  isTorrentDetailsOpen() {
    return this.torrentDetailsOpen;
  }
}

const UIStore = new UIStoreClass();

AppDispatcher.register((payload) => {
  const {action, source} = payload;

  switch (action.type) {
    case ActionTypes.UI_CLICK_TORRENT_DETAILS:
      UIStore.handleTorrentDetailsClick(action.data.hash, action.data.event);
      break;
    case ActionTypes.UI_CLICK_TORRENT:
      UIStore.handleTorrentClick(action.data.hash);
      break;
    case ActionTypes.UI_DISPLAY_MODAL:
      UIStore.setActiveModal(action.data);
      break;
  }
});

export default UIStore;
