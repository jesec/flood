import _ from 'lodash';
import classnames from 'classnames';
import {formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import Checkbox from '../../General/FormElements/Checkbox';
import Disk from '../../Icons/Disk';
import DirectoryTree from '../../General/Filesystem/DirectoryTree';
import Dropdown from '../../General/FormElements/Dropdown';
import File from '../../Icons/File';
import TorrentStore from '../../../stores/TorrentStore';

const TORRENT_PROPS_TO_CHECK = ['bytesDone'];
const METHODS_TO_BIND = [
  'handleItemSelect',
  'handlePriorityChange',
  'handlePriorityDropdownSelect',
  'handleSelectAllClick'
];

class TorrentFiles extends React.Component {
  constructor() {
    super();

    this.hasSelectionChanged = false;
    this.hasPriorityChanged = false;

    this.state = {
      allSelected: false,
      lastSelectedPath: '',
      selectedItems: {},
      selectedFiles: []
    };

    METHODS_TO_BIND.forEach((method) => {
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
      let shouldUpdate = !(_.isEqual(nextProps.fileTree, this.props.fileTree));

      // Reset the flag so we don't deeply check the next file tree.
      if (shouldUpdate) {
        this.hasPriorityChanged = false;
      }

      return shouldUpdate;
    }

    // Update when the previous props weren't defined and the next are.
    if ((!this.props.torrent && nextProps.torrent)
      || (!this.props.fileTree && nextProps.fileTree)) {
      return true;
    }

    // Check specific properties to re-render when the torrent is active.
    if (nextProps.torrent) {
      return TORRENT_PROPS_TO_CHECK.some((property) => {
        return this.props.torrent[property] !== nextProps.torrent[property];
      });
    }

    return true;
  }

  getPriorityDropdownHeader() {
    return (
      <a className="dropdown__button">
        <span className="dropdown__value">
          <FormattedMessage id="torrents.details.selected.files.set.priority"
            defaultMessage="Set Priority" />
        </span>
      </a>
    );
  }

  getPriorityDropdownItems() {
    return [
      [
        {
          displayName: this.props.intl.formatMessage({
            id: 'priority.dont.download',
            defaultMessage: 'Don\'t Download'
          }),
          selected: false,
          value: 0
        },
        {
          displayName: this.props.intl.formatMessage({
            id: 'priority.normal',
            defaultMessage: 'Normal'
          }),
          selected: false,
          value: 1
        },
        {
          displayName: this.props.intl.formatMessage({
            id: 'priority.high',
            defaultMessage: 'High'
          }),
          selected: false,
          value: 2
        }
      ]
    ];
  }

  getSelectedFiles(selectionTree, selectedFiles = []) {
    if (selectionTree.files) {
      selectedFiles = [...selectedFiles, ...Object.keys(selectionTree.files).reduce((previousValue, filename) => {
          let file = selectionTree.files[filename];

          if (file.isSelected) {
            previousValue.push(file.index);
          }

          return previousValue;
        }, [])];
    }

    if (selectionTree.directories) {
      Object.keys(selectionTree.directories).forEach((directory) => {
        selectedFiles = [...selectedFiles, ...this.getSelectedFiles(selectionTree.directories[directory])];
      });
    }

    return selectedFiles;
  }

  handlePriorityDropdownSelect(selectedPriority) {
    this.handlePriorityChange();
    TorrentStore.setFilePriority(this.props.hash, this.state.selectedFiles,
      selectedPriority.value);
  }

  handleItemSelect(selectedItem) {
    this.hasSelectionChanged = true;
    let selectedItems = this.mergeSelection(selectedItem,
      this.state.selectedItems, 0, this.props.fileTree);
    let selectedFiles = this.getSelectedFiles(selectedItems);
    this.setState({selectedItems, allSelected: false, selectedFiles});
  }

  handlePriorityChange() {
    this.hasPriorityChanged = true;
  }

  handleSelectAllClick() {
    this.hasSelectionChanged = true;
    let selectedItems = this.selectAll(this.state.selectedItems,
      this.props.fileTree, this.state.allSelected);
    let selectedFiles = this.getSelectedFiles(selectedItems);
    this.setState({selectedItems, allSelected: !this.state.allSelected,
      selectedFiles});
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

      tree.directories[pathSegment] = this.mergeSelection(item,
        tree.directories[pathSegment], depth,
        fileTree.directories[pathSegment]);
    } else {
      if (item.isSelected) {
        delete tree.isSelected;
        delete tree[selectionSubTree][pathSegment];
      } else {
        let value;

        // If a directory was checked, recursively check all its children.
        if (item.type === 'directory') {
          value = this.selectAll(tree[selectionSubTree][pathSegment],
            fileTree[selectionSubTree][pathSegment]);
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
      fileTree.files.forEach((file) => {
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
      Object.keys(fileTree.directories).forEach((directory) => {
        if (!selectionTree.directories) {
          selectionTree.directories = {};
        }

        if (deselect && selectionTree.directories[directory]) {
          delete selectionTree.directories[directory].isSelected;
        }

        selectionTree.directories[directory] = this.selectAll(
          selectionTree.directories[directory],
          fileTree.directories[directory], deselect
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
        <div className="directory-tree__checkbox">
          <div className="directory-tree__checkbox__item
            directory-tree__checkbox__item--checkbox">
            <Checkbox checked={this.state.allSelected}
              onChange={this.handleSelectAllClick} useProps={true} />
          </div>
          <div className="directory-tree__checkbox__item
            directory-tree__checkbox__item--icon">
            <Disk />
          </div>
        </div>
      );
      fileDetailContent = (
        <DirectoryTree depth={0} onItemSelect={this.handleItemSelect}
          onPriorityChange={this.handlePriorityChange}
          hash={this.props.torrent.hash}
          selectedItems={this.state.selectedItems} tree={fileTree} />
      );
    } else {
      directoryHeadingIconContent = <Disk />;
      fileDetailContent = (
        <div className="directory-tree__node directory-tree__node--file">
          Loading file detail...
        </div>
      );
    }

    let directoryHeadingClasses = classnames('directory-tree__node',
      'directory-tree__parent-directory torrent-details__section__heading', {
        'directory-tree__node--selected': this.state.allSelected
      });

    let directoryHeading = (
      <div className={directoryHeadingClasses}>
        {directoryHeadingIconContent}
        {torrent.directory}
      </div>
    );

    let wrapperClasses = classnames('directory-tree__wrapper', {
      'directory-tree__wrapper--toolbar-visible': this.state.selectedFiles.length > 0
    });

    return (
      <div className={wrapperClasses}>
        <div className="directory-tree__selection-toolbar
          modal__content--nested-scroll__header">
          <FormattedMessage id="torrents.details.selected.files"
            defaultMessage="{count, plural, =1 {{countElement} selected file} other
              {{countElement} selected files}}"
            values={{
              count: this.state.selectedFiles.length,
              countElement: <span className="directory-tree__selection-toolbar__item-count">{this.state.selectedFiles.length}</span>
            }}/>
          <Dropdown
            direction="up"
            handleItemSelect={this.handlePriorityDropdownSelect}
            header={this.getPriorityDropdownHeader()}
            menuItems={this.getPriorityDropdownItems()} />
        </div>
        <div className="directory-tree torrent-details__section
          torrent-details__section--file-tree
          modal__content--nested-scroll__content">
          {directoryHeading}
          {fileDetailContent}
        </div>
      </div>
    );
  }
}

export default injectIntl(TorrentFiles);
