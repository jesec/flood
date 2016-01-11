import React from 'react';

import DirectoryTree from './DirectoryTree';
import Icon from '../icons/Icon';

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
          <DirectoryTree tree={this.props.subTree} depth={this.props.depth} />
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
    let classes = `directory-tree__branch directory-tree__branch--depth-${this.props.depth}`;

    return (
      <div className={classes}>
        <div className="directory-tree__node directory-tree__node--directory"
          onClick={this.handleDirectoryClick}>
          <Icon icon="directoryOutlined" />
          {this.props.directoryName}
        </div>
        {this.getSubTree()}
      </div>
    );
  }
}
