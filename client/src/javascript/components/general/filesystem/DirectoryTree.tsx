import React from 'react';

import type {TorrentContentSelection, TorrentContentSelectionTree} from '@shared/types/TorrentContent';
import type {TorrentProperties} from '@shared/types/Torrent';

import DirectoryFileList from './DirectoryFileList';
// TODO: Fix this circular dependency
// eslint-disable-next-line import/no-cycle
import DirectoryTreeNode from './DirectoryTreeNode';

interface DirectoryTreeProps {
  depth?: number;
  path?: Array<string>;
  hash: TorrentProperties['hash'];
  itemsTree: TorrentContentSelectionTree;
  onPriorityChange: () => void;
  onItemSelect: (selection: TorrentContentSelection) => void;
}

const DirectoryTree: React.FC<DirectoryTreeProps> = (props: DirectoryTreeProps) => {
  const {depth = 0, itemsTree, hash, path, onItemSelect, onPriorityChange} = props;
  const {files, directories} = itemsTree;
  const childDepth = depth + 1;

  const directoryNodes: Array<React.ReactNode> =
    directories != null
      ? Object.keys(directories)
          .sort((a, b) => a.localeCompare(b))
          .map(
            (directoryName, index): React.ReactNode => {
              const subSelectedItems = itemsTree.directories && itemsTree.directories[directoryName];

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
                  onItemSelect={onItemSelect}
                  onPriorityChange={onPriorityChange}
                  path={path}
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
        onItemSelect={onItemSelect}
        onPriorityChange={onPriorityChange}
        path={path}
        items={itemsTree.files}
      />
    ) : null;

  return <div className="directory-tree__tree">{directoryNodes.concat(fileList)}</div>;
};

DirectoryTree.defaultProps = {
  depth: 0,
  path: [],
};

export default DirectoryTree;
