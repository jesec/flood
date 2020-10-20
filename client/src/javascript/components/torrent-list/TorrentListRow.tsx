import classnames from 'classnames';
import {LongPressDetectEvents, useLongPress} from 'use-long-press';
import React from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';
import type {FloodSettings} from '@shared/types/FloodSettings';

import torrentStatusClasses from '../../util/torrentStatusClasses';

import TorrentListRowCondensed from './TorrentListRowCondensed';
import TorrentListRowExpanded from './TorrentListRowExpanded';

interface TorrentListRowProps {
  torrent: TorrentProperties;
  columns: FloodSettings['torrentListColumns'];
  columnWidths: FloodSettings['torrentListColumnWidths'];
  isSelected: boolean;
  isCondensed: boolean;
  handleClick: (torrent: TorrentProperties, event: React.MouseEvent) => void;
  handleDoubleClick: (torrent: TorrentProperties, event: React.MouseEvent) => void;
  handleRightClick: (torrent: TorrentProperties, event: React.MouseEvent | React.TouchEvent) => void;
}

const TorrentListRow: React.FC<TorrentListRowProps> = (props: TorrentListRowProps) => {
  const {
    isCondensed,
    isSelected,
    columns,
    columnWidths,
    torrent,
    handleClick,
    handleDoubleClick,
    handleRightClick,
  } = props;

  const torrentClasses = torrentStatusClasses(
    torrent,
    classnames({
      'torrent--is-selected': isSelected,
      'torrent--is-condensed': isCondensed,
      'torrent--is-expanded': !isCondensed,
    }),
    'torrent',
  );

  const longPressBind = useLongPress(
    (e) => {
      if (e != null) {
        handleRightClick(torrent, e);
      }
    },
    {
      captureEvent: true,
      detect: LongPressDetectEvents.TOUCH,
      onFinish: (e) => ((e as unknown) as TouchEvent)?.preventDefault(),
    },
  );

  if (isCondensed) {
    return (
      <TorrentListRowCondensed
        className={torrentClasses}
        columns={columns}
        columnWidths={columnWidths}
        torrent={torrent}
        handleClick={handleClick}
        handleDoubleClick={handleDoubleClick}
        handleRightClick={handleRightClick}
        handleTouchStart={longPressBind.onTouchStart}
        handleTouchEnd={longPressBind.onTouchEnd}
      />
    );
  }

  return (
    <TorrentListRowExpanded
      className={torrentClasses}
      columns={columns}
      torrent={torrent}
      handleClick={handleClick}
      handleDoubleClick={handleDoubleClick}
      handleRightClick={handleRightClick}
      handleTouchStart={longPressBind.onTouchStart}
      handleTouchEnd={longPressBind.onTouchEnd}
    />
  );
};

export default React.memo(TorrentListRow);
