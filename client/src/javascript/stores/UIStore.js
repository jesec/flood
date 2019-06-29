import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';

class UIStoreClass extends BaseStore {
  constructor(...storeConfig) {
    super(...storeConfig);

    this.activeContextMenu = null;
    this.activeDropdownMenu = null;
    this.activeModal = null;
    this.dependencies = {};
    this.globalStyles = [];
    this.haveUIDependenciesResolved = false;
    this.latestTorrentLocation = null;
    this.torrentDetailsHash = null;
    this.createStyleElement();
  }

  addGlobalStyle(cssString) {
    this.globalStyles.push(cssString);
    this.applyStyles();
  }

  applyStyles() {
    const {globalStyles, styleElement} = this;
    const nextStyleString = globalStyles.join('');

    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    if (styleElement.styleSheet) {
      styleElement.styleSheet.cssText = nextStyleString;
    } else {
      styleElement.appendChild(global.document.createTextNode(nextStyleString));
    }
  }

  createStyleElement() {
    if (this.styleElement == null) {
      const stylesheetRef = global.document.createElement('style');
      stylesheetRef.type = 'text/css';

      global.document.head.appendChild(stylesheetRef);

      this.styleElement = stylesheetRef;
    }
  }

  dismissContextMenu(menuID) {
    if (this.activeContextMenu.id === menuID) {
      this.activeContextMenu = null;

      this.emit(EventTypes.UI_CONTEXT_MENU_CHANGE);
    }
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

  getDependencies() {
    return this.dependencies;
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
    return Object.keys(this.dependencies).length === 0;
  }

  removeGlobalStyle(cssString) {
    this.globalStyles = this.globalStyles.filter(style => style !== cssString);

    this.applyStyles();
  }

  registerDependency(dependencies) {
    if (!Array.isArray(dependencies)) {
      dependencies = [dependencies];
    }

    dependencies.forEach(dependency => {
      const {id} = dependency;

      if (!this.dependencies[id]) {
        this.dependencies[id] = {...dependency, satisfied: false};
      }
    });

    this.emit(EventTypes.UI_DEPENDENCIES_CHANGE);
  }

  satisfyDependency(dependencyID) {
    if (this.dependencies[dependencyID] && !this.dependencies[dependencyID].satisfied) {
      this.dependencies[dependencyID].satisfied = true;
      this.emit(EventTypes.UI_DEPENDENCIES_CHANGE);
      this.verifyDependencies();
    }
  }

  setActiveContextMenu(contextMenu) {
    this.activeContextMenu = contextMenu;
    this.emit(EventTypes.UI_CONTEXT_MENU_CHANGE);
  }

  setActiveDropdownMenu(dropdownMenu = {}) {
    this.activeDropdownMenu = dropdownMenu;
    this.emit(EventTypes.UI_DROPDOWN_MENU_CHANGE);
  }

  setActiveModal(modal = {}) {
    if (modal == null) {
      this.emit(EventTypes.UI_MODAL_DISMISSED);
    }

    this.activeModal = modal;
    this.emit(EventTypes.UI_MODAL_CHANGE);
  }

  verifyDependencies() {
    const isDependencyLoading = Object.keys(this.dependencies).some(id => this.dependencies[id].satisfied === false);

    if (!isDependencyLoading) {
      this.haveUIDependenciesResolved = true;
      this.emit(EventTypes.UI_DEPENDENCIES_LOADED);
    }
  }
}

const UIStore = new UIStoreClass();

UIStore.dispatcherID = AppDispatcher.register(payload => {
  const {action} = payload;

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
    case ActionTypes.UI_DISMISS_CONTEXT_MENU:
      UIStore.dismissContextMenu(action.data);
      break;
    case ActionTypes.UI_DISPLAY_CONTEXT_MENU:
      UIStore.setActiveContextMenu(action.data);
      break;
    case ActionTypes.NOTIFICATION_COUNT_CHANGE:
      UIStore.satisfyDependency('notifications');
      break;
    case ActionTypes.TAXONOMY_FULL_UPDATE:
      UIStore.satisfyDependency('torrent-taxonomy');
      break;
    case ActionTypes.TORRENT_LIST_FULL_UPDATE:
      UIStore.satisfyDependency('torrent-list');
      break;
    case ActionTypes.TRANSFER_SUMMARY_FULL_UPDATE:
      UIStore.satisfyDependency('transfer-data');
      break;
    case ActionTypes.TRANSFER_HISTORY_FULL_UPDATE:
      UIStore.satisfyDependency('transfer-history');
      break;
    default:
      break;
  }
});

export default UIStore;
