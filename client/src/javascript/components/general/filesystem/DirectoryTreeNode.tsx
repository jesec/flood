import classnames from 'classnames';
import {Component} from 'react';

import {Checkbox} from '@client/ui';
import {FolderClosedSolid, FolderOpenSolid} from '@client/ui/icons';

import type {TorrentContentSelection, TorrentContentSelectionTree} from '@shared/types/TorrentContent';
import type {TorrentProperties} from '@shared/types/Torrent';

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
  onItemSelect: (selection: TorrentContentSelection) => void;
}

interface DirectoryTreeNodeStates {
  expanded: boolean;
}

class DirectoryTreeNode extends Component<DirectoryTreeNodeProps, DirectoryTreeNodeStates> {
  static defaultProps = {
    path: [],
    selectedItems: {},
  };

  constructor(props: DirectoryTreeNodeProps) {
    super(props);

    this.state = {
      expanded: false,
    };
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
          <Checkbox checked={isSelected} id={id} onClick={this.handleDirectorySelection} />
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
    const {depth, itemsTree, hash, onItemSelect} = this.props;
    const {expanded} = this.state;

    if (expanded) {
      return (
        <div className="directory-tree__node directory-tree__node--group">
          <DirectoryTree
            depth={depth}
            hash={hash}
            key={`${expanded}-${depth}`}
            onItemSelect={onItemSelect}
            path={this.getCurrentPath()}
            itemsTree={itemsTree}
          />
        </div>
      );
    }

    return null;
  }

  handleDirectoryClick = (): void => {
    this.setState((state) => ({
      expanded: !state.expanded,
    }));
  };

  handleDirectorySelection = (): void => {
    const {depth, isSelected, onItemSelect} = this.props;

    onItemSelect({
      type: 'directory',
      depth,
      path: this.getCurrentPath(),
      select: !isSelected,
    });
  };

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
