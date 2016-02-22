import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';
import {selectTorrents} from '../util/selectTorrents';
import TorrentActions from '../actions/TorrentActions';

class UIStoreClass extends BaseStore {
  constructor() {
    super();

    this.activeContextMenu = null;
    this.activeModal = null;
    this.latestTorrentLocation = null;
    this.torrentDetailsHash = null;
    this.torrentDetailsOpen = false;
  }

  closeTorrentDetailsPanel() {
    if (this.torrentDetailsOpen) {
      this.torrentDetailsOpen = false;
      this.emit(EventTypes.UI_TORRENT_DETAILS_OPEN_CHANGE);
    }
  }

  fetchLatestTorrentLocation() {
    TorrentActions.fetchLatestTorrentLocation();
  }

  getActiveContextMenu() {
    return this.activeContextMenu;
  }

  getActiveModal() {
    return this.activeModal;
  }

  getLatestTorrentLocation() {
    return this.latestTorrentLocation;
  }

  getTorrentDetailsHash() {
    return this.torrentDetailsHash;
  }

  handleLatestTorrentLocationRequestSuccess(location) {
    this.latestTorrentLocation = location;
    this.emit(EventTypes.UI_LATEST_TORRENT_LOCATION_CHANGE);
  }

  handleLatestTorrentLocationRequestError(error) {
    console.log(error);
  }

  handleTorrentClick(hash) {
    this.torrentDetailsHash = hash;
    this.emit(EventTypes.UI_TORRENT_DETAILS_HASH_CHANGE);
  }

  handleTorrentDetailsClick(hash, event) {
    this.torrentDetailsOpen = !this.torrentDetailsOpen;
    this.emit(EventTypes.UI_TORRENT_DETAILS_OPEN_CHANGE);
  }

  isTorrentDetailsOpen() {
    return this.torrentDetailsOpen;
  }

  setActiveContextMenu(contextMenu = {}) {
    this.activeContextMenu = contextMenu;
    this.emit(EventTypes.UI_CONTEXT_MENU_CHANGE);
  }

  setActiveModal(modal = {}) {
    this.activeModal = modal;
    this.emit(EventTypes.UI_MODAL_CHANGE);
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
    case ActionTypes.UI_DISPLAY_CONTEXT_MENU:
      UIStore.setActiveContextMenu(action.data);
      break;
    case ActionTypes.UI_LATEST_TORRENT_LOCATION_REQUEST_SUCCESS:
      UIStore.handleLatestTorrentLocationRequestSuccess(action.data.path);
      break;
    case ActionTypes.UI_LATEST_TORRENT_LOCATION_REQUEST_ERROR:
      UIStore.handleLatestTorrentLocationRequestError(action.error);
      break;
  }
});

export default UIStore;
