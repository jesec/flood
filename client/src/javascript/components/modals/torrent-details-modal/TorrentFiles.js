import _ from 'lodash';
import {Button, Checkbox, Form, FormRow, FormRowItem, Select, SelectItem} from 'flood-ui-kit';
import classnames from 'classnames';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import ConfigStore from '../../../stores/ConfigStore';
import Disk from '../../icons/Disk';
import DirectoryTree from '../../general/filesystem/DirectoryTree';
import TorrentStore from '../../../stores/TorrentStore';

const TORRENT_PROPS_TO_CHECK = ['bytesDone'];
const METHODS_TO_BIND = ['handleItemSelect', 'handlePriorityChange', 'handleSelectAllClick'];

class TorrentFiles extends React.Component {
  constructor() {
    super();

    this.hasSelectionChanged = false;
    this.hasPriorityChanged = false;

    this.state = {
      allSelected: false,
      lastSelectedPath: '',
      selectedItems: {},
      selectedFiles: [],
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  shouldComponentUpdate(nextProps) {
    if (this.hasSelectionChanged) {
      this.hasSelectionChanged = false;
      return true;
    }

    // If we know that the user changed a file's priority, we deeply check the
    // file tree to render when the priority change is detected.
    if (this.hasPriorityChanged) {
      let shouldUpdate = !_.isEqual(nextProps.fileTree, this.props.fileTree);

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
      return TORRENT_PROPS_TO_CHECK.some(property => {
        return this.props.torrent[property] !== nextProps.torrent[property];
      });
    }

    return true;
  }

  getSelectedFiles(selectionTree, selectedFiles = []) {
    if (selectionTree.files) {
      selectedFiles = [
        ...selectedFiles,
        ...Object.keys(selectionTree.files).reduce((previousValue, filename) => {
          let file = selectionTree.files[filename];

          if (file.isSelected) {
            previousValue.push(file.index);
          }

          return previousValue;
        }, []),
      ];
    }

    if (selectionTree.directories) {
      Object.keys(selectionTree.directories).forEach(directory => {
        selectedFiles = [...selectedFiles, ...this.getSelectedFiles(selectionTree.directories[directory])];
      });
    }

    return selectedFiles;
  }

  handleDownloadButtonClick = event => {
    event.preventDefault();
    const baseURI = ConfigStore.getBaseURI();
    const link = document.createElement('a');
    link.download = `${this.props.torrent.name}.tar`;
    link.href = `${baseURI}api/download?hash=${this.props.torrent.hash}&files=${this.state.selectedFiles.join(',')}`;
    link.style.display = 'none';
    document.body.appendChild(link); // Fix for Firefox 58+
    link.click();
  };

  handleFormChange = ({event, formData}) => {
    if (event.target.name === 'file-priority') {
      this.handlePriorityChange();
      TorrentStore.setFilePriority(this.props.hash, this.state.selectedFiles, event.target.value);
    }
  };

  handleItemSelect(selectedItem) {
    this.hasSelectionChanged = true;
    let selectedItems = this.mergeSelection(selectedItem, this.state.selectedItems, 0, this.props.fileTree);
    let selectedFiles = this.getSelectedFiles(selectedItems);
    this.setState({selectedItems, allSelected: false, selectedFiles});
  }

  handlePriorityChange() {
    this.hasPriorityChanged = true;
  }

  handleSelectAllClick() {
    this.hasSelectionChanged = true;
    let selectedItems = this.selectAll(this.state.selectedItems, this.props.fileTree, this.state.allSelected);
    let selectedFiles = this.getSelectedFiles(selectedItems);
    this.setState({
      selectedItems,
      allSelected: !this.state.allSelected,
      selectedFiles,
    });
  }

  isLoaded() {
    return this.props.fileTree != null;
  }

  mergeSelection(item, tree = {}, depth = 0, fileTree = {}) {
    let {path} = item;
    let pathSegment = path[depth];
    let selectionSubTree = item.type === 'file' ? 'files' : 'directories';

    if (!tree[selectionSubTree]) {
      tree[selectionSubTree] = {};
    }

    if (!tree[selectionSubTree][pathSegment]) {
      tree[selectionSubTree][pathSegment] = {};
    }

    // If we are not at the clicked depth, then recurse over the path segments.
    if (depth++ < path.length - 1) {
      if (!tree.directories) {
        tree.directories = {[pathSegment]: {}};
      } else if (!tree.directories[pathSegment]) {
        tree.directories[pathSegment] = {};
      }

      // Deselect all parent directories if the item in question is being
      // de-selected.
      if (item.isSelected) {
        delete tree.isSelected;
      }

      tree.directories[pathSegment] = this.mergeSelection(
        item,
        tree.directories[pathSegment],
        depth,
        fileTree.directories[pathSegment]
      );
    } else {
      if (item.isSelected) {
        delete tree.isSelected;
        delete tree[selectionSubTree][pathSegment];
      } else {
        let value;

        // If a directory was checked, recursively check all its children.
        if (item.type === 'directory') {
          value = this.selectAll(tree[selectionSubTree][pathSegment], fileTree[selectionSubTree][pathSegment]);
        } else {
          value = {...item, isSelected: true};
        }

        tree[selectionSubTree][pathSegment] = value;
      }
    }

    return tree;
  }

  selectAll(selectionTree = {}, fileTree = {}, deselect = false) {
    if (fileTree.files) {
      fileTree.files.forEach(file => {
        if (!selectionTree.files) {
          selectionTree.files = {};
        }

        if (!deselect) {
          selectionTree.files[file.filename] = {...file, isSelected: true};
        } else {
          delete selectionTree.files[file.filename];
        }
      });
    }

    if (fileTree.directories) {
      Object.keys(fileTree.directories).forEach(directory => {
        if (!selectionTree.directories) {
          selectionTree.directories = {};
        }

        if (deselect && selectionTree.directories[directory]) {
          delete selectionTree.directories[directory].isSelected;
        }

        selectionTree.directories[directory] = this.selectAll(
          selectionTree.directories[directory],
          fileTree.directories[directory],
          deselect
        );
      });
    }

    selectionTree.isSelected = !deselect;
    return selectionTree;
  }

  render() {
    let {fileTree, torrent} = this.props;
    let directoryHeadingIconContent = null;
    let fileDetailContent = null;

    if (this.isLoaded()) {
      directoryHeadingIconContent = (
        <div className="file__checkbox directory-tree__checkbox">
          <div
            className="directory-tree__checkbox__item
            directory-tree__checkbox__item--checkbox">
            <FormRow>
              <Checkbox checked={this.state.allSelected} onChange={this.handleSelectAllClick} useProps={true} />
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
          <FormattedMessage id="torrents.details.files.loading" defaultMessage="Loading file detail..." />
        </div>
      );
    }

    let directoryHeadingClasses = classnames(
      'directory-tree__node',
      'directory-tree__parent-directory torrent-details__section__heading',
      {
        'directory-tree__node--selected': this.state.allSelected,
      }
    );

    let directoryHeading = (
      <div className={directoryHeadingClasses}>
        <div className="file__label">
          {directoryHeadingIconContent}
          <div className="file__name">{torrent.directory}</div>
        </div>
      </div>
    );

    let wrapperClasses = classnames('inverse directory-tree__wrapper', {
      'directory-tree__wrapper--toolbar-visible': this.state.selectedFiles.length > 0,
    });

    return (
      <Form className={wrapperClasses} onChange={this.handleFormChange}>
        <div className="directory-tree__selection-toolbar">
          <FormRow align="center">
            <FormRowItem width="one-quarter" grow={false} shrink={false}>
              <FormattedMessage
                id="torrents.details.selected.files"
                defaultMessage="{count, plural, =1 {{countElement} selected file} other
                  {{countElement} selected files}}"
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
                defaultMessage="{count, plural, =1 {Download File} other
                  {Download Files}}"
                values={{
                  count: this.state.selectedFiles.length,
                }}
              />
            </Button>
            <Select id="file-priority" persistentPlaceholder shrink={false}>
              <SelectItem placeholder>
                <FormattedMessage id="torrents.details.selected.files.set.priority" defaultMessage="Set Priority" />
              </SelectItem>
              <SelectItem id={0}>
                {this.props.intl.formatMessage({
                  id: 'priority.dont.download',
                  defaultMessage: "Don't Download",
                })}
              </SelectItem>
              <SelectItem id={1}>
                {this.props.intl.formatMessage({
                  id: 'priority.normal',
                  defaultMessage: 'Normal',
                })}
              </SelectItem>
              <SelectItem id={2}>
                {this.props.intl.formatMessage({
                  id: 'priority.high',
                  defaultMessage: 'High',
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
