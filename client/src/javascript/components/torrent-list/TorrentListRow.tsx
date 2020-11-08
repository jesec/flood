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
  const [rowLocation, setRowLocation] = React.useState<number>(0);
  const rowRef = React.createRef<HTMLLIElement>();

  const isCondensed = SettingStore.floodSettings.torrentListViewSize === 'condensed';

  const {status, upRate, downRate} = TorrentStore.torrents?.[hash] || {};
  const torrentClasses = torrentStatusClasses(
    {status, upRate, downRate},
    classnames({
      'torrent--is-selected': TorrentStore.selectedTorrents.includes(hash),
      'torrent--is-condensed': isCondensed,
      'torrent--is-expanded': !isCondensed,
    }),
    'torrent',
  );

  const longPressBind = useLongPress(
    (e) => {
      if (e != null && rowRef.current?.getBoundingClientRect().top === rowLocation) {
        handleRightClick(hash, e);
      }
    },
    {
      captureEvent: true,
      detect: LongPressDetectEvents.TOUCH,
      onStart: () => {
        setRowLocation(rowRef.current?.getBoundingClientRect().top || 0);
      },
      onFinish: (e) => ((e as unknown) as TouchEvent)?.preventDefault(),
    },
  );

  if (isCondensed) {
    return (
      <TorrentListRowCondensed
        className={torrentClasses}
        ref={rowRef}
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
      ref={rowRef}
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
