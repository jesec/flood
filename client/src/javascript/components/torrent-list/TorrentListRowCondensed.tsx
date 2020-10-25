import {observer} from 'mobx-react';
import React from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';

import {getTorrentListCellContent} from '../../util/torrentListCellContents';
import ProgressBar from '../general/ProgressBar';
import SettingStore from '../../stores/SettingStore';
import TorrentListCell from './TorrentListCell';
import torrentStatusIcons from '../../util/torrentStatusIcons';
import TorrentStore from '../../stores/TorrentStore';

interface TorrentListRowCondensedProps {
  className: string;
  hash: string;
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
      hash,
      handleClick,
      handleDoubleClick,
      handleRightClick,
      handleTouchStart,
      handleTouchEnd,
    }: TorrentListRowCondensedProps,
    ref,
  ) => {
    const torrent = TorrentStore.torrents[hash];
    const torrentListColumns = SettingStore.floodSettings.torrentListColumns.reduce(
      (accumulator: React.ReactNodeArray, {id, visible}) => {
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
          <TorrentListCell
            className="table__cell"
            key={id}
            column={id}
            content={content}
            width={SettingStore.floodSettings.torrentListColumnWidths[id]}
          />,
        );

        return accumulator;
      },
      [],
    );

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

export default observer(TorrentListRowCondensed);
