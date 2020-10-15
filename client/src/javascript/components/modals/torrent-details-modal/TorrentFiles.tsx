import classnames from 'classnames';
import {deepEqual} from 'fast-equals';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import type {TorrentContent, TorrentContentSelection, TorrentContentSelectionTree} from '@shared/types/TorrentContent';
import type {TorrentProperties} from '@shared/types/Torrent';

import {Button, Checkbox, Form, FormRow, FormRowItem, Select, SelectItem} from '../../../ui';
import ConfigStore from '../../../stores/ConfigStore';
import Disk from '../../icons/Disk';
import DirectoryTree from '../../general/filesystem/DirectoryTree';
import selectionTree from '../../../util/selectionTree';
import TorrentActions from '../../../actions/TorrentActions';

interface TorrentFilesProps extends WrappedComponentProps {
  contents: Array<TorrentContent>;
  torrent: TorrentProperties;
}

interface TorrentFilesStates {
  allSelected: boolean;
  itemsTree: TorrentContentSelectionTree;
  selectedIndices: Array<number>;
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
      itemsTree: selectionTree.getSelectionTree(this.props.contents, false),
      selectedIndices: [],
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
      const shouldUpdate = !deepEqual(nextProps.contents, this.props.contents);

      // Reset the flag so we don't deeply check the next file tree.
      if (shouldUpdate) {
        this.hasPriorityChanged = false;
      }

      return shouldUpdate;
    }

    // Update when the previous props weren't defined and the next are.
    if ((!this.props.torrent && nextProps.torrent) || (!this.props.contents && nextProps.contents)) {
      return true;
    }

    // Check specific properties to re-render when the torrent is active.
    if (nextProps.torrent) {
      return TORRENT_PROPS_TO_CHECK.some((property) => this.props.torrent[property] !== nextProps.torrent[property]);
    }

    return true;
  }

  getSelectedFiles(tree: TorrentContentSelectionTree) {
    const indices: Array<number> = [];

    if (tree.files != null) {
      const {files} = tree;
      Object.keys(files).forEach((fileName) => {
        const file = files[fileName];

        if (file.isSelected) {
          indices.push(file.index);
        }
      });
    }

    if (tree.directories != null) {
      const {directories} = tree;
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
    link.href = `${baseURI}api/torrents/${this.props.torrent.hash}/contents/${this.state.selectedIndices.join(
      ',',
    )}/data`;
    link.style.display = 'none';
    document.body.appendChild(link); // Fix for Firefox 58+
    link.click();
  };

  handleFormChange = ({event}: {event: Event | React.FormEvent<HTMLFormElement>}): void => {
    if (event.target != null && (event.target as HTMLInputElement).name === 'file-priority') {
      const inputElement = event.target as HTMLInputElement;
      if (inputElement.name === 'file-priority') {
        this.handlePriorityChange();
        TorrentActions.setFilePriority(this.props.torrent.hash, {
          indices: this.state.selectedIndices,
          priority: Number(inputElement.value),
        });
      }
    }
  };

  handleItemSelect(selectedItem: TorrentContentSelection) {
    this.hasSelectionChanged = true;
    this.setState((state) => {
      const selectedItems = selectionTree.applySelection(state.itemsTree, selectedItem);
      const selectedFiles = this.getSelectedFiles(selectedItems);

      return {
        itemsTree: selectedItems,
        allSelected: false,
        selectedIndices: selectedFiles,
      };
    });
  }

  handlePriorityChange() {
    this.hasPriorityChanged = true;
  }

  handleSelectAllClick() {
    this.hasSelectionChanged = true;

    this.setState((state, props) => {
      const selectedItems = selectionTree.getSelectionTree(props.contents, state.allSelected);
      const selectedFiles = this.getSelectedFiles(selectedItems);

      return {
        itemsTree: selectedItems,
        allSelected: !state.allSelected,
        selectedIndices: selectedFiles,
      };
    });
  }

  isLoaded() {
    return this.props.contents != null;
  }

  render() {
    const {torrent} = this.props;
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
          itemsTree={this.state.itemsTree}
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
      'directory-tree__wrapper--toolbar-visible': this.state.selectedIndices.length > 0,
    });

    return (
      <Form className={wrapperClasses} onChange={this.handleFormChange}>
        <div className="directory-tree__selection-toolbar">
          <FormRow align="center">
            <FormRowItem width="one-quarter" grow={false} shrink={false}>
              <FormattedMessage
                id="torrents.details.selected.files"
                values={{
                  count: this.state.selectedIndices.length,
                  countElement: (
                    <span className="directory-tree__selection-toolbar__item-count">
                      {this.state.selectedIndices.length}
                    </span>
                  ),
                }}
              />
            </FormRowItem>
            <Button onClick={this.handleDownloadButtonClick} grow={false} shrink={false}>
              <FormattedMessage
                id="torrents.details.files.download.file"
                values={{
                  count: this.state.selectedIndices.length,
                }}
              />
            </Button>
            <Select id="file-priority" persistentPlaceholder shrink={false} defaultID="">
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
