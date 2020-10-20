import React from 'react';

import type {FloodSettings} from '@shared/types/FloodSettings';
import type {TorrentProperties} from '@shared/types/Torrent';

import {getTorrentListCellContent} from '../../util/torrentListCellContents';
import ProgressBar from '../general/ProgressBar';
import TorrentListCell from './TorrentListCell';
import torrentStatusIcons from '../../util/torrentStatusIcons';

interface TorrentListRowCondensedProps {
  className: string;
  columns: FloodSettings['torrentListColumns'];
  columnWidths: FloodSettings['torrentListColumnWidths'];
  torrent: TorrentProperties;
  handleClick: (torrent: TorrentProperties, event: React.MouseEvent) => void;
  handleDoubleClick: (torrent: TorrentProperties, event: React.MouseEvent) => void;
  handleRightClick: (torrent: TorrentProperties, event: React.MouseEvent) => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  handleTouchEnd: (event: React.TouchEvent) => void;
}

const TorrentListRowCondensed = React.forwardRef<HTMLLIElement, TorrentListRowCondensedProps>(
  (
    {
      className,
      columns,
      columnWidths,
      torrent,
      handleClick,
      handleDoubleClick,
      handleRightClick,
      handleTouchStart,
      handleTouchEnd,
    }: TorrentListRowCondensedProps,
    ref,
  ) => {
    const torrentListColumns = columns.reduce((accumulator: React.ReactNodeArray, {id, visible}) => {
      if (!visible) {
        return accumulator;
      }

      const content: React.ReactNode =
        id === 'percentComplete' ? (
          <ProgressBar percent={torrent.percentComplete} icon={torrentStatusIcons(torrent.status)} />
        ) : (
          getTorrentListCellContent(torrent, id)
        );

      accumulator.push(
        <TorrentListCell className="table__cell" key={id} column={id} content={content} width={columnWidths[id]} />,
      );

      return accumulator;
    }, []);

    return (
      <li
        className={className}
        onClick={handleClick.bind(this, torrent)}
        onContextMenu={handleRightClick.bind(this, torrent)}
        onDoubleClick={handleDoubleClick.bind(this, torrent)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        ref={ref}>
        {torrentListColumns}
      </li>
    );
  },
);

export default React.memo(TorrentListRowCondensed);
