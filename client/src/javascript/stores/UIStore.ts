import {makeAutoObservable} from 'mobx';
import {FC, MouseEvent} from 'react';

import type {ProcessedFiles} from '@client/components/general/form-elements/FileDropzone';
import type {TorrentContextMenuAction} from '@client/constants/TorrentContextMenuActions';

export type ContextMenuItem =
  | {
      type: 'action';
      action: TorrentContextMenuAction;
      label: string;
      labelAction?: FC;
      labelSecondary?: FC;
      clickHandler(event: MouseEvent): void;
      dismissMenu?: boolean;
    }
  | {
      type: 'separator';
    };

export interface ActiveContextMenu {
  id: string;
  clickPosition: {
    x: number;
    y: number;
  };
  items: Array<ContextMenuItem>;
}

export interface Dependency {
  id: string;
  message: {id: string} | string;
  satisfied?: boolean;
}

export type Dependencies = Record<string, Dependency>;

interface BaseModalAction {
  content: React.ReactNode;
  triggerDismiss?: boolean;
}

interface CheckboxModalAction extends BaseModalAction {
  type: 'checkbox';
  id?: string;
  checked?: boolean;
  clickHandler?: ((event: React.MouseEvent<HTMLInputElement> | KeyboardEvent) => void) | null;
}

interface ButtonModalAction extends BaseModalAction {
  type: 'primary' | 'tertiary';
  isLoading?: boolean;
  submit?: boolean;
  clickHandler?: ((event: React.MouseEvent<HTMLButtonElement>) => void) | null;
}

export type ModalAction = CheckboxModalAction | ButtonModalAction;

export type Modal =
  | {
      id:
        | 'feeds'
        | 'generate-magnet'
        | 'move-torrents'
        | 'remove-torrents'
        | 'set-taxonomy'
        | 'set-trackers'
        | 'settings';
    }
  | {
      id: 'add-torrents';
      tab?: 'by-url';
      urls?: Array<{id: number; value: string}>;
    }
  | {
      id: 'add-torrents';
      tab: 'by-file';
      files: ProcessedFiles;
    }
  | {
      id: 'confirm';
      content: React.ReactNode;
      heading: React.ReactNode;
      actions: Array<ModalAction>;
    }
  | {
      id: 'torrent-details';
      hash: string;
    };

class UIStore {
  activeContextMenu: ActiveContextMenu | null = null;
  activeDropdownMenu: string | null = null;
  activeModal: Modal | null = null;
  dependencies: Dependencies = {};
  globalStyles: Array<string> = [];
  haveUIDependenciesResolved = false;
  styleElement: HTMLStyleElement & {
    styleSheet?: {cssText: string};
  } = this.createStyleElement();

  constructor() {
    makeAutoObservable(this);
  }

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

  dismissContextMenu(menuID: ActiveContextMenu['id']) {
    if (this.activeContextMenu != null && this.activeContextMenu.id === menuID) {
      this.activeContextMenu = null;
    }
  }

  handleSetTaxonomySuccess() {
    if (this.activeModal != null && this.activeModal.id === 'set-taxonomy') {
      this.setActiveModal(null);
    }
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
  }

  satisfyDependency(dependencyID: string) {
    if (this.dependencies[dependencyID] && !this.dependencies[dependencyID].satisfied) {
      this.dependencies[dependencyID].satisfied = true;
      this.verifyDependencies();
    }
  }

  setActiveContextMenu(contextMenu: this['activeContextMenu']) {
    this.activeContextMenu = contextMenu;
  }

  setActiveDropdownMenu(dropdownMenu: this['activeDropdownMenu']) {
    this.activeDropdownMenu = dropdownMenu;
  }

  setActiveModal(modal: this['activeModal']) {
    this.activeModal = modal;
  }

  verifyDependencies() {
    const isDependencyLoading = Object.keys(this.dependencies).some((id) => this.dependencies[id].satisfied === false);

    if (!isDependencyLoading) {
      this.haveUIDependenciesResolved = true;
    }
  }
}

export default new UIStore();
