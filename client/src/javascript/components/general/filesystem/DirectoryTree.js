import PropTypes from 'prop-types';
import React from 'react';

import DirectoryFileList from './DirectoryFileList';
// TODO: Fix this circular dependency
// eslint-disable-next-line import/no-cycle
import DirectoryTreeNode from './DirectoryTreeNode';

const METHODS_TO_BIND = ['getDirectoryTreeDomNodes'];

class DirectoryTree extends React.Component {
  static propTypes = {
    isParentSelected: PropTypes.bool,
    path: PropTypes.array,
    selectedItems: PropTypes.object,
  };

  static defaultProps = {
    isParentSelected: false,
    path: [],
    selectedItems: {},
  };

  constructor() {
    super();

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getDirectoryTreeDomNodes(tree = {}, depth = 0) {
    const {files = []} = tree;
    let {directories = {}} = tree;
    const {hash} = this.props;
    let fileList = null;
    depth++;

    directories = Object.keys(directories)
      .sort(this.sortDirectories)
      .map((directoryName, index) => {
        let subSelectedItems = {};

        if (this.props.selectedItems.directories) {
          subSelectedItems = this.props.selectedItems.directories[directoryName];
        }

        const subTree = directories[directoryName];
        const id = `${index}${depth}${directoryName}`;
        const isSelected = subSelectedItems && subSelectedItems.isSelected;

        return (
          <DirectoryTreeNode
            depth={depth}
            directoryName={directoryName}
            hash={hash}
            id={id}
            isSelected={isSelected}
            isParentSelected={this.props.isParentSelected}
            key={id}
            selectedItems={subSelectedItems}
            onItemSelect={this.props.onItemSelect}
            onPriorityChange={this.props.onPriorityChange}
            path={this.props.path}
            subTree={subTree}
          />
        );
      });

    if (files.length) {
      const subSelectedItems = this.props.selectedItems.files;

      fileList = (
        <DirectoryFileList
          depth={depth}
          fileList={files}
          hash={hash}
          key={`files-${depth}`}
          isParentSelected={this.props.isParentSelected}
          onItemSelect={this.props.onItemSelect}
          onPriorityChange={this.props.onPriorityChange}
          path={this.props.path}
          selectedItems={subSelectedItems}
        />
      );
    }

    return directories.concat([fileList]);
  }

  sortDirectories(a, b) {
    return a.localeCompare(b);
  }

  render() {
    return (
      <div className="directory-tree__tree">{this.getDirectoryTreeDomNodes(this.props.tree, this.props.depth)}</div>
    );
  }
}

export default DirectoryTree;
