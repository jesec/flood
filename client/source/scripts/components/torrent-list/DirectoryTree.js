import React from 'react';

import DirectoryFileList from './DirectoryFileList';
import DirectoryTreeNode from './DirectoryTreeNode';

export default class DirectoryTree extends React.Component {
  getDirectoryTreeDomNodes(tree, depth = 0) {
    let index = 0;
    depth++;

    return Object.keys(tree).map((branchName) => {
      let branch = tree[branchName];
      index++;

      if (branchName === 'files') {
        return <DirectoryFileList branch={branch} key={`${index}${depth}`} />;
      } else {
        return <DirectoryTreeNode depth={depth} directoryName={branchName}
          subTree={branch} key={`${index}${depth}`} />;
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
