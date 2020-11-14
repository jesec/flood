import classnames from 'classnames';
import {CSSProperties, FC, MouseEvent, TouchEvent, useRef, useState} from 'react';
import {observer} from 'mobx-react';
import {useLongPress} from 'react-use';

import SettingStore from '../../stores/SettingStore';
import torrentStatusClasses from '../../util/torrentStatusClasses';
import TorrentStore from '../../stores/TorrentStore';

import TorrentListContextMenu from './TorrentListContextMenu';
import TorrentListRowCondensed from './TorrentListRowCondensed';
import TorrentListRowExpanded from './TorrentListRowExpanded';
import UIActions from '../../actions/UIActions';

const displayTorrentDetails = (hash: string) => TorrentListContextMenu.handleDetailsClick(hash);
const selectTorrent = (hash: string, event: MouseEvent | TouchEvent) => UIActions.handleTorrentClick({hash, event});

interface TorrentListRowProps {
  hash: string;
  style: CSSProperties;
  displayContextMenu: (hash: string, event: MouseEvent | TouchEvent) => void;
}

const TorrentListRow: FC<TorrentListRowProps> = observer((props: TorrentListRowProps) => {
  const {hash, style, displayContextMenu} = props;
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
        displayContextMenu(hash, (e as unknown) as TouchEvent);
      }
    },
    {isPreventDefault: true},
  );

  const onTouchStartHooked = (e: TouchEvent) => {
    if (TorrentStore.selectedTorrents.includes(hash)) {
      displayTorrentDetails(hash);
    } else {
      selectTorrent(hash, e);
    }

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
        handleClick={selectTorrent}
        handleDoubleClick={displayTorrentDetails}
        handleRightClick={displayContextMenu}
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
      handleClick={selectTorrent}
      handleDoubleClick={displayTorrentDetails}
      handleRightClick={displayContextMenu}
      handleTouchStart={onTouchStartHooked}
      handleTouchEnd={onTouchEnd}
    />
  );
});

export default TorrentListRow;
