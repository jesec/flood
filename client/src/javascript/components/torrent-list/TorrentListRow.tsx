import classnames from 'classnames';
import {CSSProperties, FC, MouseEvent, TouchEvent, useRef, useState} from 'react';
import {observer} from 'mobx-react';
import {useLongPress} from 'react-use';

import SettingStore from '../../stores/SettingStore';
import torrentStatusClasses from '../../util/torrentStatusClasses';
import TorrentStore from '../../stores/TorrentStore';

import TorrentListRowCondensed from './TorrentListRowCondensed';
import TorrentListRowExpanded from './TorrentListRowExpanded';

interface TorrentListRowProps {
  style: CSSProperties;
  hash: string;
  handleClick: (hash: string, event: MouseEvent) => void;
  handleDoubleClick: (hash: string, event: MouseEvent) => void;
  handleRightClick: (hash: string, event: MouseEvent | TouchEvent) => void;
}

const TorrentListRow: FC<TorrentListRowProps> = observer((props: TorrentListRowProps) => {
  const {style, hash, handleClick, handleDoubleClick, handleRightClick} = props;
  const [rowLocation, setRowLocation] = useState<number>(0);
  const rowRef = useRef<HTMLLIElement>(null);

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

  const {onTouchStart, onTouchEnd} = useLongPress(
    (e) => {
      if (e != null && rowRef.current?.getBoundingClientRect().top === rowLocation) {
        handleRightClick(hash, (e as unknown) as TouchEvent);
      }
    },
    {isPreventDefault: true},
  );

  const onTouchStartHooked = (e: TouchEvent) => {
    setRowLocation(rowRef.current?.getBoundingClientRect().top || 0);
    onTouchStart(e);
  };

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
        handleTouchStart={onTouchStartHooked}
        handleTouchEnd={onTouchEnd}
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
      handleTouchStart={onTouchStartHooked}
      handleTouchEnd={onTouchEnd}
    />
  );
});

export default TorrentListRow;
