import React from 'react';

import type {TorrentContentSelection, TorrentContentSelectionTree} from '@shared/types/TorrentContent';
import type {TorrentProperties} from '@shared/types/Torrent';

import DirectoryFileList from './DirectoryFileList';
// TODO: Fix this circular dependency
// eslint-disable-next-line import/no-cycle
import DirectoryTreeNode from './DirectoryTreeNode';

interface DirectoryTreeProps {
  depth?: number;
  path: Array<string>;
  hash: TorrentProperties['hash'];
  itemsTree: TorrentContentSelectionTree;
  onPriorityChange: () => void;
  onItemSelect: (selection: TorrentContentSelection) => void;
}

const METHODS_TO_BIND = ['getDirectoryTreeDomNodes'] as const;

class DirectoryTree extends React.Component<DirectoryTreeProps> {
  static defaultProps = {
    path: [],
    itemsTree: {},
  };

  constructor(props: DirectoryTreeProps) {
    super(props);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getDirectoryTreeDomNodes(itemsTree: TorrentContentSelectionTree, depth = 0) {
    const {hash} = this.props;
    const {files, directories} = itemsTree;
    const childDepth = depth + 1;

    const directoryNodes: Array<React.ReactNode> =
      directories != null
        ? Object.keys(directories)
            .sort((a, b) => a.localeCompare(b))
            .map(
              (directoryName, index): React.ReactNode => {
                const subSelectedItems =
                  this.props.itemsTree.directories && this.props.itemsTree.directories[directoryName];

                const id = `${index}${childDepth}${directoryName}`;
                const isSelected = (subSelectedItems && subSelectedItems.isSelected) || false;

                if (subSelectedItems == null) {
                  return null;
                }

                return (
                  <DirectoryTreeNode
                    depth={childDepth}
                    directoryName={directoryName}
                    hash={hash}
                    id={id}
                    isSelected={isSelected}
                    key={id}
                    itemsTree={subSelectedItems}
                    onItemSelect={this.props.onItemSelect}
                    onPriorityChange={this.props.onPriorityChange}
                    path={this.props.path}
                  />
                );
              },
            )
        : [];

    const fileList: React.ReactNode =
      files != null && Object.keys(files).length > 0 ? (
        <DirectoryFileList
          depth={childDepth}
          hash={hash}
          key={`files-${childDepth}`}
          onItemSelect={this.props.onItemSelect}
          onPriorityChange={this.props.onPriorityChange}
          path={this.props.path}
          items={this.props.itemsTree.files}
        />
      ) : null;

    return directoryNodes.concat(fileList);
  }

  render() {
    return (
      <div className="directory-tree__tree">
        {this.getDirectoryTreeDomNodes(this.props.itemsTree, this.props.depth)}
      </div>
    );
  }
}

export default DirectoryTree;
