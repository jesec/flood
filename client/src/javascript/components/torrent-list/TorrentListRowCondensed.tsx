import {observer} from 'mobx-react';
import React from 'react';

import ProgressBar from '../general/ProgressBar';
import SettingStore from '../../stores/SettingStore';
import TorrentListCell from './TorrentListCell';
import torrentStatusIcons from '../../util/torrentStatusIcons';

interface TorrentListRowCondensedProps {
  className: string;
  hash: string;
  handleClick: (hash: string, event: React.MouseEvent) => void;
  handleDoubleClick: (hash: string, event: React.MouseEvent) => void;
  handleRightClick: (hash: string, event: React.MouseEvent) => void;
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
    const torrentListColumns = SettingStore.floodSettings.torrentListColumns.reduce(
      (accumulator: React.ReactNodeArray, {id, visible}) => {
        if (!visible) {
          return accumulator;
        }

        if (id === 'percentComplete') {
          accumulator.push(
            <TorrentListCell
              className="table__cell"
              key={id}
              hash={hash}
              column={id}
              content={(torrent) => (
                <ProgressBar percent={torrent.percentComplete} icon={torrentStatusIcons(torrent.status)} />
              )}
              width={SettingStore.floodSettings.torrentListColumnWidths[id]}
            />,
          );

          return accumulator;
        }

        accumulator.push(
          <TorrentListCell
            className="table__cell"
            key={id}
            hash={hash}
            column={id}
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
        onClick={handleClick.bind(this, hash)}
        onContextMenu={handleRightClick.bind(this, hash)}
        onDoubleClick={handleDoubleClick.bind(this, hash)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        ref={ref}>
        {torrentListColumns}
      </li>
    );
  },
);

export default observer(TorrentListRowCondensed);
