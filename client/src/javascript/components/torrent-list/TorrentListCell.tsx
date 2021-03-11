import classnames from 'classnames';
import {FC, ReactNode} from 'react';
import {observer} from 'mobx-react';

import {DetailNotAvailable} from '@client/ui/icons';
import {getTorrentListCellContent} from '@client/util/torrentListCellContents';
import torrentPropertyIcons from '@client/util/torrentPropertyIcons';
import TorrentStore from '@client/stores/TorrentStore';

import type {TorrentListColumn} from '@client/constants/TorrentListColumns';

import type {TorrentProperties} from '@shared/types/Torrent';

interface TorrentListCellProps {
  hash: string;
  column: TorrentListColumn;
  content?: (torrent: TorrentProperties, column: TorrentListColumn) => ReactNode;
  className?: string;
  classNameOverride?: boolean;
  width?: number;
  showIcon?: boolean;
}

const TorrentListCell: FC<TorrentListCellProps> = observer(
  ({hash, content, column, className, classNameOverride, width, showIcon}: TorrentListCellProps) => {
    const icon = showIcon ? torrentPropertyIcons[column] : null;

    return (
      <div
        className={
          classNameOverride ? className : classnames('torrent__detail', `torrent__detail--${column}`, className)
        }
        role="cell"
        style={{width: `${width}px`}}>
        {icon}
        {content?.(TorrentStore.torrents[hash], column) || <DetailNotAvailable />}
      </div>
    );
  },
);

TorrentListCell.defaultProps = {
  className: undefined,
  classNameOverride: false,
  content: getTorrentListCellContent,
  width: undefined,
  showIcon: false,
};

export default TorrentListCell;
