import {Checkbox} from 'flood-ui-kit';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import FolderClosedSolid from '../../icons/FolderClosedSolid';
import FolderOpenSolid from '../../icons/FolderOpenSolid';
// TODO: Fix this circular dependency
// eslint-disable-next-line import/no-cycle
import DirectoryTree from './DirectoryTree';

const METHODS_TO_BIND = ['handleDirectoryClick', 'handleDirectorySelection'];

class DirectoryTreeNode extends React.Component {
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

    this.state = {
      expanded: false,
    };

    METHODS_TO_BIND.forEach(method => {
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
      <div className="file__checkbox directory-tree__checkbox">
        <div
          className="directory-tree__checkbox__item
          directory-tree__checkbox__item--checkbox">
          <Checkbox
            checked={this.props.isSelected}
            id={this.props.id}
            onChange={this.handleDirectorySelection}
            useProps
          />
        </div>
        <div
          className="directory-tree__checkbox__item
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
          <DirectoryTree
            tree={this.props.subTree}
            depth={this.props.depth}
            hash={this.props.hash}
            isParentSelected={this.props.isSelected || this.props.isParentSelected}
            key={`${this.state.expanded}-${this.props.depth}`}
            onPriorityChange={this.props.onPriorityChange}
            onItemSelect={this.props.onItemSelect}
            path={this.getCurrentPath()}
            selectedItems={this.props.selectedItems}
          />
        </div>
      );
    }

    return null;
  }

  handleDirectoryClick() {
    this.setState(state => {
      return {
        expanded: !state.expanded,
      };
    });
  }

  handleDirectorySelection(event) {
    this.props.onItemSelect({
      depth: this.props.depth,
      event,
      id: this.props.id,
      isParentSelected: this.props.isParentSelected,
      isSelected: this.props.isSelected,
      path: this.getCurrentPath(),
      type: 'directory',
    });
  }

  render() {
    const branchClasses = classnames('directory-tree__branch', `directory-tree__branch--depth-${this.props.depth}`, {
      'directory-tree__node--selected': this.props.isSelected,
    });
    const directoryClasses = classnames(
      'directory-tree__node',
      'directory-tree__node--selectable directory-tree__node--directory',
      {
        'is-expanded': this.state.expanded,
      },
    );

    return (
      <div className={branchClasses}>
        <div className={directoryClasses} onClick={this.handleDirectoryClick} title={this.props.directoryName}>
          <div className="file__label">
            {this.getIcon()}
            <div className="file__name">{this.props.directoryName}</div>
          </div>
        </div>
        {this.getSubTree()}
      </div>
    );
  }
}

export default DirectoryTreeNode;
