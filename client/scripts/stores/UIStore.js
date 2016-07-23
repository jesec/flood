import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';
import {selectTorrents} from '../util/selectTorrents';
import TorrentActions from '../actions/TorrentActions';
import TorrentStore from './TorrentStore';

class UIStoreClass extends BaseStore {
  constructor() {
    super(...arguments);

    this.activeContextMenu = null;
    this.activeDropdownMenu = null;
    this.activeModal = null;
    this.dependencies = [];
    this.latestTorrentLocation = null;
    this.torrentDetailsHash = null;
  }

  dismissModal() {
    this.setActiveModal(null);
  }

  getActiveContextMenu() {
    return this.activeContextMenu;
  }

  getActiveModal() {
    return this.activeModal;
  }

  getActiveDropdownMenu() {
    return this.activeDropdownMenu;
  }

  getLatestTorrentLocation() {
    return this.latestTorrentLocation;
  }

  getTorrentDetailsHash() {
    return this.torrentDetailsHash;
  }

  handleSetTaxonomySuccess() {
    if (this.activeModal.id === 'set-taxonomy') {
      this.dismissModal();
    }
  }

  handleTorrentClick(hash) {
    this.torrentDetailsHash = hash;
    this.emit(EventTypes.UI_TORRENT_DETAILS_HASH_CHANGE);
  }

  hasSatisfiedDependencies() {
    return this.dependencies.length === 0;
  }

  registerDependency(ids) {
    if (!Array.isArray(ids)) {
      ids = [ids];
    }

    ids.forEach((id) => {
      if (this.dependencies.indexOf(id) === -1) {
        this.dependencies.push(id);
      }
    });
  }

  satisfyDependency(id) {
    let dependencyIndex = this.dependencies.indexOf(id);

    if (dependencyIndex > -1) {
      this.dependencies.splice(dependencyIndex, 1);
    }

    this.verifyDependencies();
  }

  setActiveContextMenu(contextMenu = {}) {
    this.activeContextMenu = contextMenu;
    this.emit(EventTypes.UI_CONTEXT_MENU_CHANGE);
  }

  setActiveDropdownMenu(dropdownMenu = {}) {
    this.activeDropdownMenu = dropdownMenu;
    this.emit(EventTypes.UI_DROPDOWN_MENU_CHANGE);
  }

  setActiveModal(modal = {}) {
    this.activeModal = modal;
    this.emit(EventTypes.UI_MODAL_CHANGE);
  }

  verifyDependencies() {
    if (this.dependencies.length === 0) {
      this.emit(EventTypes.UI_DEPENDENCIES_LOADED);
    }
  }
}

let UIStore = new UIStoreClass();

UIStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action, source} = payload;

  switch (action.type) {
    case ActionTypes.UI_CLICK_TORRENT:
      UIStore.handleTorrentClick(action.data.hash);
      break;
    case ActionTypes.UI_DISPLAY_DROPDOWN_MENU:
      UIStore.setActiveDropdownMenu(action.data);
      break;
    case ActionTypes.UI_DISPLAY_MODAL:
      UIStore.setActiveModal(action.data);
      break;
    case ActionTypes.CLIENT_SET_TAXONOMY_SUCCESS:
      UIStore.handleSetTaxonomySuccess();
      break;
    case ActionTypes.CLIENT_ADD_TORRENT_SUCCESS:
    case ActionTypes.CLIENT_MOVE_TORRENTS_SUCCESS:
      UIStore.dismissModal();
      break;
    case ActionTypes.UI_DISPLAY_CONTEXT_MENU:
      UIStore.setActiveContextMenu(action.data);
      break;
  }
});

export default UIStore;
