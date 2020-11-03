import classnames from 'classnames';
import {observer} from 'mobx-react';
import * as React from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';

import DetailNotAvailableIcon from '../icons/DetailNotAvailableIcon';
import {getTorrentListCellContent} from '../../util/torrentListCellContents';
import torrentPropertyIcons from '../../util/torrentPropertyIcons';
import TorrentStore from '../../stores/TorrentStore';

import type {TorrentListColumn} from '../../constants/TorrentListColumns';

interface TorrentListCellProps {
  hash: string;
  column: TorrentListColumn;
  content?: (torrent: TorrentProperties, column: TorrentListColumn) => React.ReactNode;
  className?: string;
  classNameOverride?: boolean;
  width?: number;
  showIcon?: boolean;
}

const TorrentListCell: React.FC<TorrentListCellProps> = ({
  hash,
  content,
  column,
  className,
  classNameOverride,
  width,
  showIcon,
}: TorrentListCellProps) => {
  const icon = showIcon ? torrentPropertyIcons[column] : null;

  return (
    <div
      className={classNameOverride ? className : classnames('torrent__detail', `torrent__detail--${column}`, className)}
      style={{width: `${width}px`}}>
      {icon}
      {content?.(TorrentStore.torrents[hash], column) || <DetailNotAvailableIcon />}
    </div>
  );
};

TorrentListCell.defaultProps = {
  className: undefined,
  classNameOverride: false,
  content: getTorrentListCellContent,
  width: undefined,
  showIcon: false,
};

export default observer(TorrentListCell);
