import React from 'react';

import DirectoryFileList from './DirectoryFileList';
import DirectoryTreeNode from './DirectoryTreeNode';

const METHODS_TO_BIND = ['getDirectoryTreeDomNodes'];

export default class DirectoryTree extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getDirectoryTreeDomNodes(tree, depth = 0) {
    let index = 0;
    let hash = this.props.hash;
    depth++;

    return Object.keys(tree).map((branchName) => {
      let branch = tree[branchName];
      index++;

      if (branchName === 'files') {
        return (
          <DirectoryFileList branch={branch} hash={hash}
            key={`${index}${depth}`} />
        );
      } else {
        return (
          <DirectoryTreeNode depth={depth} directoryName={branchName}
            hash={hash} subTree={branch} key={`${index}${depth}`} />
        );
      }
    });
  }

  render() {
    return (
      <div className="directory-tree__tree">
        {this.getDirectoryTreeDomNodes(this.props.tree, this.props.depth)}
      </div>
    );
  }
}
