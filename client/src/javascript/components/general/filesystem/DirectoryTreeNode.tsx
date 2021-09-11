import classnames from 'classnames';
import {FC, useState} from 'react';

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

const DirectoryTreeNode: FC<DirectoryTreeNodeProps> = ({
  depth,
  directoryName,
  id,
  itemsTree,
  hash,
  path,
  isSelected,
  onItemSelect,
}: DirectoryTreeNodeProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const currentPath = [...path, directoryName];

  return (
    <div
      className={classnames('directory-tree__branch', `directory-tree__branch--depth-${depth}`, {
        'directory-tree__node--selected': isSelected,
      })}
    >
      <button
        className={classnames(
          'directory-tree__node',
          'directory-tree__node--selectable directory-tree__node--directory',
          {
            'is-expanded': expanded,
          },
        )}
        css={{
          width: '100%',
          textAlign: 'left',
          ':focus': {
            outline: 'none',
            WebkitTapHighlightColor: 'transparent',
          },
          ':focus-visible': {
            outline: 'dashed',
          },
        }}
        type="button"
        onClick={() => setExpanded(!expanded)}
        title={directoryName}
      >
        <div className="file__label">
          <div className="file__checkbox directory-tree__checkbox">
            <div
              className="directory-tree__checkbox__item
          directory-tree__checkbox__item--checkbox"
            >
              <Checkbox
                checked={isSelected}
                id={id}
                onClick={() =>
                  onItemSelect({
                    type: 'directory',
                    depth,
                    path: currentPath,
                    select: !isSelected,
                  })
                }
              />
            </div>
            <div
              className="directory-tree__checkbox__item
          directory-tree__checkbox__item--icon"
            >
              {expanded ? <FolderOpenSolid /> : <FolderClosedSolid />}
            </div>
          </div>
          <div className="file__name">{directoryName}</div>
        </div>
      </button>
      {expanded ? (
        <div className="directory-tree__node directory-tree__node--group">
          <DirectoryTree
            depth={depth}
            hash={hash}
            key={`${expanded}-${depth}`}
            onItemSelect={onItemSelect}
            path={currentPath}
            itemsTree={itemsTree}
          />
        </div>
      ) : null}
    </div>
  );
};

export default DirectoryTreeNode;
