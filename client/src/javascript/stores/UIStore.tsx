import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';

export interface ContextMenuItem {
  type?: 'separator';
  action: string;
  label: string;
  labelAction?: React.ReactNode;
  labelSecondary?: React.ReactNode;
  clickHandler(action: ContextMenuItem['action'], event: React.MouseEvent<HTMLLIElement>): void;
  dismissMenu?: boolean;
}

export interface ContextMenu {
  id: string;
  clickPosition: {
    x: number;
    y: number;
  };
  items: Array<ContextMenuItem>;
}

export interface Dependency {
  id: string;
  message: JSX.Element;
  satisfied: boolean;
}

export type Dependencies = Record<string, Dependency>;

export interface Modal {
  id: string;
  torrents?: unknown;
}

class UIStoreClass extends BaseStore {
  activeContextMenu: ContextMenu | null = null;
  activeDropdownMenu: string | null = null;
  activeModal: Modal | null = null;
  dependencies: Dependencies = {};
  globalStyles: Array<string> = [];
  haveUIDependenciesResolved = false;
  torrentDetailsHash: string | null = null;
  styleElement: HTMLStyleElement & {styleSheet?: {cssText: string}} = this.createStyleElement();

  addGlobalStyle(cssString: string) {
    this.globalStyles.push(cssString);
    this.applyStyles();
  }

  applyStyles() {
    const {globalStyles, styleElement} = this;
    const nextStyleString = globalStyles.join('');

    if (styleElement == null) {
      return;
    }

    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    if (styleElement.styleSheet) {
      styleElement.styleSheet.cssText = nextStyleString;
    } else {
      styleElement.appendChild(document.createTextNode(nextStyleString));
    }
  }

  createStyleElement() {
    if (this.styleElement == null) {
      const stylesheetRef = document.createElement('style');
      stylesheetRef.type = 'text/css';

      document.head.appendChild(stylesheetRef);

      return stylesheetRef;
    }
    return this.styleElement;
  }

  dismissContextMenu(menuID: ContextMenu['id']) {
    if (this.activeContextMenu != null && this.activeContextMenu.id === menuID) {
      this.activeContextMenu = null;

      this.emit('UI_CONTEXT_MENU_CHANGE');
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

  getTorrentDetailsHash() {
    return this.torrentDetailsHash;
  }

  handleSetTaxonomySuccess() {
    if (this.activeModal != null && this.activeModal.id === 'set-taxonomy') {
      this.dismissModal();
    }
  }

  handleTorrentClick({hash}: {hash: string}) {
    this.torrentDetailsHash = hash;
    this.emit('UI_TORRENT_DETAILS_HASH_CHANGE');
  }

  hasSatisfiedDependencies() {
    return Object.keys(this.dependencies).length === 0;
  }

  removeGlobalStyle(cssString: string) {
    this.globalStyles = this.globalStyles.filter((style) => style !== cssString);

    this.applyStyles();
  }

  registerDependency(dependencies: Array<Omit<Dependency, 'satisfied'>>) {
    dependencies.forEach((dependency) => {
      const {id} = dependency;

      if (!this.dependencies[id]) {
        this.dependencies[id] = {...dependency, satisfied: false};
      }
    });

    this.emit('UI_DEPENDENCIES_CHANGE');
  }

  satisfyDependency(dependencyID: string) {
    if (this.dependencies[dependencyID] && !this.dependencies[dependencyID].satisfied) {
      this.dependencies[dependencyID].satisfied = true;
      this.emit('UI_DEPENDENCIES_CHANGE');
      this.verifyDependencies();
    }
  }

  setActiveContextMenu(contextMenu: this['activeContextMenu']) {
    this.activeContextMenu = contextMenu;
    this.emit('UI_CONTEXT_MENU_CHANGE');
  }

  setActiveDropdownMenu(dropdownMenu: this['activeDropdownMenu']) {
    this.activeDropdownMenu = dropdownMenu;
    this.emit('UI_DROPDOWN_MENU_CHANGE');
  }

  setActiveModal(modal: this['activeModal']) {
    if (modal == null) {
      this.emit('UI_MODAL_DISMISSED');
    }

    this.activeModal = modal;
    this.emit('UI_MODAL_CHANGE');
  }

  verifyDependencies() {
    const isDependencyLoading = Object.keys(this.dependencies).some((id) => this.dependencies[id].satisfied === false);

    if (!isDependencyLoading) {
      this.haveUIDependenciesResolved = true;
      this.emit('UI_DEPENDENCIES_LOADED');
    }
  }
}

const UIStore = new UIStoreClass();

UIStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action} = payload;

  switch (action.type) {
    case 'UI_CLICK_TORRENT':
      UIStore.handleTorrentClick(action.data as {hash: string});
      break;
    case 'UI_DISPLAY_DROPDOWN_MENU':
      UIStore.setActiveDropdownMenu(action.data as string);
      break;
    case 'UI_DISPLAY_MODAL':
      UIStore.setActiveModal(action.data as {id: string} | null);
      break;
    case 'CLIENT_SET_TAXONOMY_SUCCESS':
      UIStore.handleSetTaxonomySuccess();
      break;
    case 'CLIENT_SET_TRACKER_SUCCESS':
    case 'CLIENT_ADD_TORRENT_SUCCESS':
    case 'CLIENT_MOVE_TORRENTS_SUCCESS':
      UIStore.dismissModal();
      break;
    case 'UI_DISMISS_CONTEXT_MENU':
      UIStore.dismissContextMenu(action.data as ContextMenu['id']);
      break;
    case 'UI_DISPLAY_CONTEXT_MENU':
      UIStore.setActiveContextMenu(action.data as ContextMenu);
      break;
    case 'NOTIFICATION_COUNT_CHANGE':
      UIStore.satisfyDependency('notifications');
      break;
    case 'TAXONOMY_FULL_UPDATE':
      UIStore.satisfyDependency('torrent-taxonomy');
      break;
    case 'TORRENT_LIST_FULL_UPDATE':
      UIStore.satisfyDependency('torrent-list');
      break;
    case 'TRANSFER_SUMMARY_FULL_UPDATE':
      UIStore.satisfyDependency('transfer-data');
      break;
    case 'TRANSFER_HISTORY_FULL_UPDATE':
      UIStore.satisfyDependency('transfer-history');
      break;
    default:
      break;
  }
});

export default UIStore;
