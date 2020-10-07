import PropTypes from 'prop-types';
import React from 'react';

import type {TorrentContentSelection, TorrentContentSelectionTree} from '@shared/types/TorrentContent';
import type {TorrentDetails, TorrentProperties} from '@shared/types/Torrent';

import DirectoryFileList from './DirectoryFileList';
// TODO: Fix this circular dependency
// eslint-disable-next-line import/no-cycle
import DirectoryTreeNode from './DirectoryTreeNode';

interface DirectoryTreeProps {
  depth?: number;
  path: Array<string>;
  hash: TorrentProperties['hash'];
  tree: TorrentDetails['fileTree'];
  selectedItems: TorrentContentSelectionTree;
  onPriorityChange: () => void;
  onItemSelect: (selection: TorrentContentSelection) => void;
}

const METHODS_TO_BIND = ['getDirectoryTreeDomNodes'] as const;

class DirectoryTree extends React.Component<DirectoryTreeProps> {
  static propTypes = {
    path: PropTypes.array,
    selectedItems: PropTypes.object,
  };

  static defaultProps = {
    path: [],
    selectedItems: {},
  };

  constructor(props: DirectoryTreeProps) {
    super(props);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getDirectoryTreeDomNodes(tree: TorrentDetails['fileTree'], depth = 0) {
    const {hash} = this.props;
    const {files, directories} = tree;
    const childDepth = depth + 1;

    const directoryNodes: Array<React.ReactNode> =
      directories != null
        ? Object.keys(directories)
            .sort((a, b) => a.localeCompare(b))
            .map(
              (directoryName, index): React.ReactNode => {
                const subSelectedItems =
                  this.props.selectedItems.directories && this.props.selectedItems.directories[directoryName];

                const subTree = directories[directoryName];
                const id = `${index}${childDepth}${directoryName}`;
                const isSelected = (subSelectedItems && subSelectedItems.isSelected) || false;

                return (
                  <DirectoryTreeNode
                    depth={childDepth}
                    directoryName={directoryName}
                    hash={hash}
                    id={id}
                    isSelected={isSelected}
                    key={id}
                    selectedItems={subSelectedItems}
                    onItemSelect={this.props.onItemSelect}
                    onPriorityChange={this.props.onPriorityChange}
                    path={this.props.path}
                    subTree={subTree}
                  />
                );
              },
            )
        : [];

    const fileList: React.ReactNode =
      files != null && files.length > 0 ? (
        <DirectoryFileList
          depth={childDepth}
          fileList={files}
          hash={hash}
          key={`files-${childDepth}`}
          onItemSelect={this.props.onItemSelect}
          onPriorityChange={this.props.onPriorityChange}
          path={this.props.path}
          selectedItems={this.props.selectedItems.files}
        />
      ) : null;

    return directoryNodes.concat(fileList);
  }

  render() {
    return (
      <div className="directory-tree__tree">{this.getDirectoryTreeDomNodes(this.props.tree, this.props.depth)}</div>
    );
  }
}

export default DirectoryTree;
