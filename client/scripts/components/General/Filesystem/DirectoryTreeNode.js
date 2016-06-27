import classnames from 'classnames';
import React from 'react';

import FolderClosedSolid from '../../Icons/FolderClosedSolid';
import FolderOpenSolid from '../../Icons/FolderOpenSolid';
import DirectoryTree from './DirectoryTree';

const METHODS_TO_BIND = ['handleDirectoryClick'];

export default class DirectoryTreeNode extends React.Component {
  constructor() {
    super();

    this.state = {
      expanded: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getSubTree() {
    if (this.state.expanded) {
      return (
        <div className="directory-tree__node directory-tree__node--group">
          <DirectoryTree tree={this.props.subTree} depth={this.props.depth}
            hash={this.props.hash} key={`${this.state.expanded}-${this.props.depth}`} />
        </div>
      );
    } else {
      return null;
    }
  }

  handleDirectoryClick() {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  render() {
    let branchClasses = `directory-tree__branch directory-tree__branch--depth-${this.props.depth}`;
    let directoryClasses = classnames('directory-tree__node directory-tree__selectable',
      'directory-tree__node--directory', {'is-expanded': this.state.expanded}
    );

    let icon = <FolderClosedSolid />;

    if (this.state.expanded) {
      icon = <FolderOpenSolid />;
    }

    return (
      <div className={branchClasses}>
        <div className={directoryClasses}
          onClick={this.handleDirectoryClick} title={this.props.directoryName}>
          {icon}
          {this.props.directoryName}
        </div>
        {this.getSubTree()}
      </div>
    );
  }
}
