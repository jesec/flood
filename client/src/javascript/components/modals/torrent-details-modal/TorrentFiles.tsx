import classnames from 'classnames';
import isEqual from 'lodash/isEqual';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import type {
  TorrentContentSelection,
  TorrentContentSelectionTree,
  TorrentContentTree,
} from '@shared/constants/torrentFilePropsMap';
import type {TorrentProperties} from '@shared/types/Torrent';

import {Button, Checkbox, Form, FormRow, FormRowItem, Select, SelectItem} from '../../../ui';
import ConfigStore from '../../../stores/ConfigStore';
import Disk from '../../icons/Disk';
import DirectoryTree from '../../general/filesystem/DirectoryTree';
import TorrentActions from '../../../actions/TorrentActions';

interface TorrentFilesProps extends WrappedComponentProps {
  fileTree: TorrentContentTree;
  torrent: TorrentProperties;
}

interface TorrentFilesStates {
  allSelected: boolean;
  selectedItems: TorrentContentSelectionTree;
  selectedFiles: Array<number>;
}

const TORRENT_PROPS_TO_CHECK = ['bytesDone'] as const;
const METHODS_TO_BIND = ['handleItemSelect', 'handlePriorityChange', 'handleSelectAllClick'] as const;

class TorrentFiles extends React.Component<TorrentFilesProps, TorrentFilesStates> {
  hasSelectionChanged = false;
  hasPriorityChanged = false;

  constructor(props: TorrentFilesProps) {
    super(props);

    this.state = {
      allSelected: false,
      selectedItems: this.selectAll(this.props.fileTree, false),
      selectedFiles: [],
    };

    METHODS_TO_BIND.forEach(<T extends typeof METHODS_TO_BIND[number]>(methodName: T) => {
      this[methodName] = this[methodName].bind(this);
    });
  }

  shouldComponentUpdate(nextProps: this['props']) {
    if (this.hasSelectionChanged) {
      this.hasSelectionChanged = false;
      return true;
    }

    // If we know that the user changed a file's priority, we deeply check the
    // file tree to render when the priority change is detected.
    if (this.hasPriorityChanged) {
      const shouldUpdate = !isEqual(nextProps.fileTree, this.props.fileTree);

      // Reset the flag so we don't deeply check the next file tree.
      if (shouldUpdate) {
        this.hasPriorityChanged = false;
      }

      return shouldUpdate;
    }

    // Update when the previous props weren't defined and the next are.
    if ((!this.props.torrent && nextProps.torrent) || (!this.props.fileTree && nextProps.fileTree)) {
      return true;
    }

    // Check specific properties to re-render when the torrent is active.
    if (nextProps.torrent) {
      return TORRENT_PROPS_TO_CHECK.some((property) => this.props.torrent[property] !== nextProps.torrent[property]);
    }

    return true;
  }

  getSelectedFiles(selectionTree: TorrentContentSelectionTree) {
    const indices: Array<number> = [];

    if (selectionTree.files != null) {
      const {files} = selectionTree;
      Object.keys(files).forEach((fileName) => {
        const file = files[fileName];

        if (file.isSelected) {
          indices.push(file.index);
        }
      });
    }

    if (selectionTree.directories != null) {
      const {directories} = selectionTree;
      Object.keys(directories).forEach((directoryName) => {
        indices.push(...this.getSelectedFiles(directories[directoryName]));
      });
    }

    return indices;
  }

  handleDownloadButtonClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    const baseURI = ConfigStore.getBaseURI();
    const link = document.createElement('a');
    link.download = `${this.props.torrent.name}.tar`;
    link.href = `${baseURI}api/torrents/${this.props.torrent.hash}/contents/${this.state.selectedFiles.join(',')}/data`;
    link.style.display = 'none';
    document.body.appendChild(link); // Fix for Firefox 58+
    link.click();
  };

  handleFormChange = ({event}: {event: Event | React.FormEvent<HTMLFormElement>}): void => {
    if (event.target != null && (event.target as HTMLInputElement).name === 'file-priority') {
      const inputElement = event.target as HTMLInputElement;
      if (inputElement.name === 'file-priority') {
        this.handlePriorityChange();
        TorrentActions.setFilePriority(this.props.torrent.hash, this.state.selectedFiles, Number(inputElement.value));
      }
    }
  };

  handleItemSelect(selectedItem: TorrentContentSelection) {
    this.hasSelectionChanged = true;
    this.setState((state) => {
      const selectedItems = this.mergeSelection(selectedItem, 0, state.selectedItems, this.props.fileTree);
      const selectedFiles = this.getSelectedFiles(selectedItems);

      return {
        selectedItems,
        allSelected: false,
        selectedFiles,
      };
    });
  }

  handlePriorityChange() {
    this.hasPriorityChanged = true;
  }

  handleSelectAllClick() {
    this.hasSelectionChanged = true;

    this.setState((state, props) => {
      const selectedItems = this.selectAll(props.fileTree, state.allSelected);
      const selectedFiles = this.getSelectedFiles(selectedItems);

      return {
        selectedItems,
        allSelected: !state.allSelected,
        selectedFiles,
      };
    });
  }

  isLoaded() {
    return this.props.fileTree != null;
  }

  mergeSelection(
    item: TorrentContentSelection,
    currentDepth: number,
    tree: TorrentContentSelectionTree,
    fileTree: TorrentContentTree = {},
  ): TorrentContentSelectionTree {
    const {depth, path, select, type} = item;
    const currentPath = path[currentDepth];

    // Change happens
    if (currentDepth === depth - 1) {
      if (type === 'file' && tree.files != null && tree.files[currentPath] != null) {
        const files = {
          ...tree.files,
          [currentPath]: {
            ...tree.files[currentPath],
            isSelected: select,
          },
        };

        return {
          ...tree,
          files,
          isSelected:
            Object.values(files).every(({isSelected}) => isSelected) &&
            (tree.directories != null ? Object.values(tree.directories).every(({isSelected}) => isSelected) : true),
        };
      }

      if (
        type === 'directory' &&
        tree.directories != null &&
        fileTree.directories != null &&
        fileTree.directories[currentPath] != null
      ) {
        const directories = {
          ...tree.directories,
          [currentPath]: this.selectAll(fileTree.directories[currentPath], select),
        };

        return {
          ...tree,
          directories,
          isSelected:
            Object.values(directories).every(({isSelected}) => isSelected) &&
            (tree.files != null ? Object.values(tree.files).every(({isSelected}) => isSelected) : true),
        };
      }

      return tree;
    }

    // Recursive call till we reach the target
    if (tree.directories != null && fileTree.directories != null) {
      const selectionSubTree = tree.directories;
      const fileSubTree = fileTree.directories;
      Object.keys(selectionSubTree).forEach((directory) => {
        if (directory === currentPath) {
          selectionSubTree[directory] = this.mergeSelection(
            item,
            currentDepth + 1,
            selectionSubTree[directory],
            fileSubTree[directory],
          );
        }
      });
      return {
        ...tree,
        directories: selectionSubTree,
        isSelected: Object.values(selectionSubTree).every(({isSelected}) => isSelected),
      };
    }

    return tree;
  }

  selectAll(fileTree: TorrentContentTree, isSelected = true): TorrentContentSelectionTree {
    const {files, directories} = fileTree;
    const selectionTree: TorrentContentSelectionTree = {};

    if (files) {
      const selectedFiles: Exclude<TorrentContentSelectionTree['files'], undefined> = {};
      files.forEach((file) => {
        selectedFiles[file.filename] = {...file, isSelected};
      });
      selectionTree.files = selectedFiles;
    }

    if (directories) {
      const selectedDirectories: Exclude<TorrentContentSelectionTree['directories'], undefined> = {};
      Object.keys(directories).forEach((directory) => {
        selectedDirectories[directory] = this.selectAll(directories[directory], isSelected);
      });
      selectionTree.directories = selectedDirectories;
    }

    selectionTree.isSelected = isSelected;
    return selectionTree;
  }

  render() {
    const {fileTree, torrent} = this.props;
    let directoryHeadingIconContent = null;
    let fileDetailContent = null;

    if (this.isLoaded()) {
      directoryHeadingIconContent = (
        <div className="file__checkbox directory-tree__checkbox">
          <div
            className="directory-tree__checkbox__item
            directory-tree__checkbox__item--checkbox">
            <FormRow>
              <Checkbox checked={this.state.allSelected} onChange={this.handleSelectAllClick} useProps />
            </FormRow>
          </div>
          <div
            className="directory-tree__checkbox__item
            directory-tree__checkbox__item--icon">
            <Disk />
          </div>
        </div>
      );
      fileDetailContent = (
        <DirectoryTree
          depth={0}
          onItemSelect={this.handleItemSelect}
          onPriorityChange={this.handlePriorityChange}
          hash={this.props.torrent.hash}
          selectedItems={this.state.selectedItems}
          tree={fileTree}
        />
      );
    } else {
      directoryHeadingIconContent = <Disk />;
      fileDetailContent = (
        <div className="directory-tree__node directory-tree__node--file">
          <FormattedMessage id="torrents.details.files.loading" />
        </div>
      );
    }

    const directoryHeadingClasses = classnames(
      'directory-tree__node',
      'directory-tree__parent-directory torrent-details__section__heading',
      {
        'directory-tree__node--selected': this.state.allSelected,
      },
    );

    const directoryHeading = (
      <div className={directoryHeadingClasses}>
        <div className="file__label">
          {directoryHeadingIconContent}
          <div className="file__name">{torrent.directory}</div>
        </div>
      </div>
    );

    const wrapperClasses = classnames('inverse directory-tree__wrapper', {
      'directory-tree__wrapper--toolbar-visible': this.state.selectedFiles.length > 0,
    });

    return (
      <Form className={wrapperClasses} onChange={this.handleFormChange}>
        <div className="directory-tree__selection-toolbar">
          <FormRow align="center">
            <FormRowItem width="one-quarter" grow={false} shrink={false}>
              <FormattedMessage
                id="torrents.details.selected.files"
                values={{
                  count: this.state.selectedFiles.length,
                  countElement: (
                    <span className="directory-tree__selection-toolbar__item-count">
                      {this.state.selectedFiles.length}
                    </span>
                  ),
                }}
              />
            </FormRowItem>
            <Button onClick={this.handleDownloadButtonClick} grow={false} shrink={false}>
              <FormattedMessage
                id="torrents.details.files.download.file"
                values={{
                  count: this.state.selectedFiles.length,
                }}
              />
            </Button>
            <Select id="file-priority" persistentPlaceholder shrink={false}>
              <SelectItem placeholder>
                <FormattedMessage id="torrents.details.selected.files.set.priority" />
              </SelectItem>
              <SelectItem id={0}>
                {this.props.intl.formatMessage({
                  id: 'priority.dont.download',
                })}
              </SelectItem>
              <SelectItem id={1}>
                {this.props.intl.formatMessage({
                  id: 'priority.normal',
                })}
              </SelectItem>
              <SelectItem id={2}>
                {this.props.intl.formatMessage({
                  id: 'priority.high',
                })}
              </SelectItem>
            </Select>
          </FormRow>
        </div>
        <div className="directory-tree torrent-details__section torrent-details__section--file-tree modal__content--nested-scroll__content">
          {directoryHeading}
          {fileDetailContent}
        </div>
      </Form>
    );
  }
}

export default injectIntl(TorrentFiles);
