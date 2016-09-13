import classnames from 'classnames';
import React from 'react';

import Checkbox from '../FormElements/Checkbox';
import FolderClosedSolid from '../../Icons/FolderClosedSolid';
import FolderOpenSolid from '../../Icons/FolderOpenSolid';
import DirectoryTree from './DirectoryTree';

const METHODS_TO_BIND = ['handleDirectoryClick', 'handleDirectorySelection'];

class DirectoryTreeNode extends React.Component {
  constructor() {
    super();

    this.state = {
      expanded: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getCurrentPath() {
    return [...this.props.path, this.props.directoryName];
  }

  getIcon() {
    let icon = null;

    if (this.state.expanded) {
      icon = <FolderOpenSolid />;
    } else {
      icon = <FolderClosedSolid />;
    }

    return (
      <div className="directory-tree__checkbox">
        <div className="directory-tree__checkbox__item
          directory-tree__checkbox__item--checkbox">
          <Checkbox checked={this.props.isSelected}
            onChange={this.handleDirectorySelection} useProps={true} />
        </div>
        <div className="directory-tree__checkbox__item
          directory-tree__checkbox__item--icon">
          {icon}
        </div>
      </div>
    );
  }

  getSubTree() {
    if (this.state.expanded) {
      return (
        <div className="directory-tree__node directory-tree__node--group">
          <DirectoryTree tree={this.props.subTree} depth={this.props.depth}
            hash={this.props.hash}
            isParentSelected={this.props.isSelected || this.props.isParentSelected}
            key={`${this.state.expanded}-${this.props.depth}`}
            onPriorityChange={this.props.onPriorityChange}
            onItemSelect={this.props.onItemSelect}
            path={this.getCurrentPath()}
            selectedItems={this.props.selectedItems} />
        </div>
      );
    }

    return null;
  }

  handleDirectoryClick(event) {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  handleDirectorySelection(value, event) {
    this.props.onItemSelect({
      depth: this.props.depth,
      event,
      id: this.props.id,
      isParentSelected: this.props.isParentSelected,
      isSelected: this.props.isSelected,
      path: this.getCurrentPath(),
      type: 'directory'
    });
  }

  render() {
    let branchClasses = classnames('directory-tree__branch',
      `directory-tree__branch--depth-${this.props.depth}`, {
        'directory-tree__node--selected': this.props.isSelected,
      });
    let directoryClasses = classnames('directory-tree__node',
      'directory-tree__node--selectable directory-tree__node--directory', {
        'is-expanded': this.state.expanded
      });

    return (
      <div className={branchClasses}>
        <div className={directoryClasses}
          onClick={this.handleDirectoryClick}
          title={this.props.directoryName}>
          {this.getIcon()}
          {this.props.directoryName}
        </div>
        {this.getSubTree()}
      </div>
    );
  }
}

DirectoryTreeNode.defaultProps = {
  isParentSelected: false,
  path: [],
  selectedItems: {}
};

DirectoryTreeNode.propTypes = {
  isParentSelected: React.PropTypes.bool,
  path: React.PropTypes.array,
  selectedItems: React.PropTypes.object
};

export default DirectoryTreeNode;
