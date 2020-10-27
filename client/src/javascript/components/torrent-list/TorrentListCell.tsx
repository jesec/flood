import classnames from 'classnames';
import React from 'react';

import DetailNotAvailableIcon from '../icons/DetailNotAvailableIcon';
import torrentPropertyIcons from '../../util/torrentPropertyIcons';

import type {TorrentListColumn} from '../../constants/TorrentListColumns';

interface TorrentListCellProps {
  content: React.ReactNode;
  column: TorrentListColumn;
  className?: string;
  width?: number;
  showIcon?: boolean;
}

const TorrentListCell: React.FC<TorrentListCellProps> = ({
  content,
  column,
  className,
  width,
  showIcon,
}: TorrentListCellProps) => {
  const icon = showIcon ? torrentPropertyIcons[column as keyof typeof torrentPropertyIcons] : null;

  return (
    <div
      className={classnames('torrent__detail', `torrent__detail--${column}`, className)}
      style={{width: `${width}px`}}>
      {icon}
      {content || <DetailNotAvailableIcon />}
    </div>
  );
};

TorrentListCell.defaultProps = {
  className: undefined,
  width: undefined,
  showIcon: false,
};

export default React.memo(TorrentListCell);
