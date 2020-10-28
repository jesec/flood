import classnames from 'classnames';
import {LongPressDetectEvents, useLongPress} from 'use-long-press';
import {observer} from 'mobx-react';
import * as React from 'react';

import SettingStore from '../../stores/SettingStore';
import torrentStatusClasses from '../../util/torrentStatusClasses';
import TorrentStore from '../../stores/TorrentStore';

import TorrentListRowCondensed from './TorrentListRowCondensed';
import TorrentListRowExpanded from './TorrentListRowExpanded';

interface TorrentListRowProps {
  style: React.CSSProperties;
  hash: string;
  handleClick: (hash: string, event: React.MouseEvent) => void;
  handleDoubleClick: (hash: string, event: React.MouseEvent) => void;
  handleRightClick: (hash: string, event: React.MouseEvent | React.TouchEvent) => void;
}

const TorrentListRow: React.FC<TorrentListRowProps> = (props: TorrentListRowProps) => {
  const {style, hash, handleClick, handleDoubleClick, handleRightClick} = props;

  const isCondensed = SettingStore.floodSettings.torrentListViewSize === 'condensed';

  const torrentClasses = torrentStatusClasses(
    TorrentStore.torrents?.[hash].status,
    classnames({
      'torrent--is-selected': TorrentStore.selectedTorrents.includes(hash),
      'torrent--is-condensed': isCondensed,
      'torrent--is-expanded': !isCondensed,
    }),
    'torrent',
  );

  const longPressBind = useLongPress(
    (e) => {
      if (e != null) {
        handleRightClick(hash, e);
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
        style={style}
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
      style={style}
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
