import classnames from 'classnames';
import {LongPressDetectEvents, useLongPress} from 'use-long-press';
import {observer} from 'mobx-react';
import React from 'react';

import type {TorrentProperties} from '@shared/types/Torrent';

import SettingStore from '../../stores/SettingStore';
import torrentStatusClasses from '../../util/torrentStatusClasses';
import TorrentStore from '../../stores/TorrentStore';

import TorrentListRowCondensed from './TorrentListRowCondensed';
import TorrentListRowExpanded from './TorrentListRowExpanded';

interface TorrentListRowProps {
  hash: string;
  handleClick: (torrent: TorrentProperties, event: React.MouseEvent) => void;
  handleDoubleClick: (torrent: TorrentProperties, event: React.MouseEvent) => void;
  handleRightClick: (torrent: TorrentProperties, event: React.MouseEvent | React.TouchEvent) => void;
}

const TorrentListRow: React.FC<TorrentListRowProps> = (props: TorrentListRowProps) => {
  const {hash, handleClick, handleDoubleClick, handleRightClick} = props;

  const torrent = TorrentStore.torrents[hash];
  const isCondensed = SettingStore.floodSettings.torrentListViewSize === 'condensed';

  const torrentClasses = torrentStatusClasses(
    torrent,
    classnames({
      'torrent--is-selected': TorrentStore.selectedTorrents.includes(torrent.hash),
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
        hash={hash}
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
      hash={hash}
      handleClick={handleClick}
      handleDoubleClick={handleDoubleClick}
      handleRightClick={handleRightClick}
      handleTouchStart={longPressBind.onTouchStart}
      handleTouchEnd={longPressBind.onTouchEnd}
    />
  );
};

export default observer(TorrentListRow);
