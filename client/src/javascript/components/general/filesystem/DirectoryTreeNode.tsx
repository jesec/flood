import classnames from 'classnames';
import React from 'react';

import type {TorrentContentSelection, TorrentContentSelectionTree} from '@shared/types/TorrentContent';
import type {TorrentProperties} from '@shared/types/Torrent';

import {Checkbox} from '../../../ui';
import FolderClosedSolid from '../../icons/FolderClosedSolid';
import FolderOpenSolid from '../../icons/FolderOpenSolid';
// TODO: Fix this circular dependency
// eslint-disable-next-line import/no-cycle
import DirectoryTree from './DirectoryTree';

interface DirectoryTreeNodeProps {
  id: string;
  depth: number;
  hash: TorrentProperties['hash'];
  path: Array<string>;
  directoryName: string;
  itemsTree: TorrentContentSelectionTree;
  isSelected: boolean;
  onPriorityChange: () => void;
  onItemSelect: (selection: TorrentContentSelection) => void;
}

interface DirectoryTreeNodeStates {
  expanded: boolean;
}

const METHODS_TO_BIND = ['handleDirectoryClick', 'handleDirectorySelection'] as const;

class DirectoryTreeNode extends React.Component<DirectoryTreeNodeProps, DirectoryTreeNodeStates> {
  static defaultProps = {
    path: [],
    selectedItems: {},
  };

  constructor(props: DirectoryTreeNodeProps) {
    super(props);

    this.state = {
      expanded: false,
    };

    METHODS_TO_BIND.forEach(<T extends typeof METHODS_TO_BIND[number]>(methodName: T) => {
      this[methodName] = this[methodName].bind(this);
    });
  }

  getCurrentPath() {
    const {path, directoryName} = this.props;

    return [...path, directoryName];
  }

  getIcon() {
    const {id, isSelected} = this.props;
    const {expanded} = this.state;

    let icon = null;
    if (expanded) {
      icon = <FolderOpenSolid />;
    } else {
      icon = <FolderClosedSolid />;
    }

    return (
      <div className="file__checkbox directory-tree__checkbox">
        <div
          className="directory-tree__checkbox__item
          directory-tree__checkbox__item--checkbox">
          <Checkbox checked={isSelected} id={id} onChange={this.handleDirectorySelection} useProps />
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
    const {depth, itemsTree, hash, onItemSelect, onPriorityChange} = this.props;
    const {expanded} = this.state;

    if (expanded) {
      return (
        <div className="directory-tree__node directory-tree__node--group">
          <DirectoryTree
            depth={depth}
            hash={hash}
            key={`${expanded}-${depth}`}
            onPriorityChange={onPriorityChange}
            onItemSelect={onItemSelect}
            path={this.getCurrentPath()}
            itemsTree={itemsTree}
          />
        </div>
      );
    }

    return null;
  }

  handleDirectoryClick() {
    this.setState((state) => {
      return {
        expanded: !state.expanded,
      };
    });
  }

  handleDirectorySelection() {
    const {depth, isSelected, onItemSelect} = this.props;

    onItemSelect({
      type: 'directory',
      depth,
      path: this.getCurrentPath(),
      select: !isSelected,
    });
  }

  render() {
    const {depth, directoryName, isSelected} = this.props;
    const {expanded} = this.state;

    const branchClasses = classnames('directory-tree__branch', `directory-tree__branch--depth-${depth}`, {
      'directory-tree__node--selected': isSelected,
    });
    const directoryClasses = classnames(
      'directory-tree__node',
      'directory-tree__node--selectable directory-tree__node--directory',
      {
        'is-expanded': expanded,
      },
    );

    return (
      <div className={branchClasses}>
        <div className={directoryClasses} onClick={this.handleDirectoryClick} title={directoryName}>
          <div className="file__label">
            {this.getIcon()}
            <div className="file__name">{directoryName}</div>
          </div>
        </div>
        {this.getSubTree()}
      </div>
    );
  }
}

export default DirectoryTreeNode;
