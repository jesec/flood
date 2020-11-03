import {observer} from 'mobx-react';
import * as React from 'react';

import ProgressBar from '../general/ProgressBar';
import SettingStore from '../../stores/SettingStore';
import TorrentListCell from './TorrentListCell';
import TorrentListColumns from '../../constants/TorrentListColumns';
import torrentStatusIcons from '../../util/torrentStatusIcons';

interface TorrentListRowCondensedProps {
  className: string;
  style: React.CSSProperties;
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
      style,
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
        if (TorrentListColumns[id] == null) {
          return accumulator;
        }

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
        style={style}
        onClick={(e) => handleClick(hash, e)}
        onContextMenu={(e) => handleRightClick(hash, e)}
        onDoubleClick={(e) => handleDoubleClick(hash, e)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        ref={ref}>
        {torrentListColumns}
      </li>
    );
  },
);

export default observer(TorrentListRowCondensed);
