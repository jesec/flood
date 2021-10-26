import classnames from 'classnames';
import {computed} from 'mobx';
import {CSSProperties, FC, KeyboardEvent, MouseEvent, TouchEvent, useRef, useState} from 'react';
import {observer} from 'mobx-react';
import {useLongPress} from 'react-use';

import defaultFloodSettings from '@shared/constants/defaultFloodSettings';

import SettingStore from '@client/stores/SettingStore';
import {torrentStatusClasses} from '@client/util/torrentStatus';
import TorrentStore from '@client/stores/TorrentStore';
import UIStore from '@client/stores/UIStore';

import {getContextMenuItems} from './TorrentListContextMenu';
import TorrentListRowCondensed from './TorrentListRowCondensed';
import TorrentListRowExpanded from './TorrentListRowExpanded';

const displayContextMenu = (hash: string, event: KeyboardEvent | MouseEvent | TouchEvent) => {
  if (event.cancelable === true) {
    event.preventDefault();
  }

  const mouseClientX = (event as unknown as MouseEvent).clientX;
  const mouseClientY = (event as unknown as MouseEvent).clientY;
  const touchClientX = (event as unknown as TouchEvent).touches?.[0].clientX;
  const touchClientY = (event as unknown as TouchEvent).touches?.[0].clientY;

  if (!TorrentStore.selectedTorrents.includes(hash)) {
    TorrentStore.setSelectedTorrents({hash, event});
  }

  const {torrentContextMenuActions = defaultFloodSettings.torrentContextMenuActions} = SettingStore.floodSettings;
  const torrent = TorrentStore.torrents[hash];

  UIStore.setActiveContextMenu({
    id: 'torrent-list-item',
    clickPosition: {
      x: mouseClientX || touchClientX || 0,
      y: mouseClientY || touchClientY || 0,
    },
    items: getContextMenuItems(torrent).filter((item) => {
      if (item.type === 'separator') {
        return true;
      }

      return torrentContextMenuActions.some((action) => action.id === item.action && action.visible === true);
    }),
  });
};

const displayTorrentDetails = (hash: string) => UIStore.setActiveModal({id: 'torrent-details', hash});

const selectTorrent = (hash: string, event: KeyboardEvent | MouseEvent | TouchEvent) =>
  TorrentStore.setSelectedTorrents({hash, event});

const onKeyPress = (hash: string, e: KeyboardEvent) => {
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'ContextMenu') {
    e.preventDefault();
    if (TorrentStore.selectedTorrents.includes(hash)) {
      if (e.key === 'Enter') {
        displayTorrentDetails(hash);
      } else if (e.key === 'ContextMenu') {
        displayContextMenu(hash, e);
      }
    } else {
      selectTorrent(hash, e);
    }
  }
};

interface TorrentListRowProps {
  hash: string;
  style: CSSProperties;
}

const TorrentListRow: FC<TorrentListRowProps> = observer(({hash, style}: TorrentListRowProps) => {
  const [rowLocation, setRowLocation] = useState<number>(0);
  const shouldDisplayTorrentDetails = useRef<boolean>(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const isCondensed = SettingStore.floodSettings.torrentListViewSize === 'condensed';
  const isSelected = computed(() => TorrentStore.selectedTorrents.includes(hash)).get();

  const {status, upRate, downRate} = TorrentStore.torrents?.[hash] || {};
  const torrentClasses = torrentStatusClasses(
    {status, upRate, downRate},
    classnames({
      'torrent--is-selected': isSelected,
      'torrent--is-condensed': isCondensed,
      'torrent--is-expanded': !isCondensed,
    }),
    'torrent',
  );

  const {onTouchStart, onTouchEnd} = useLongPress((e) => {
    const curRowLocation = rowRef.current?.getBoundingClientRect().top;
    if (e != null && curRowLocation != null && Math.abs(curRowLocation - rowLocation) < 25) {
      displayContextMenu(hash, e as unknown as TouchEvent);
    }
  });

  const onTouchStartHooked = (e: TouchEvent) => {
    if (!TorrentStore.selectedTorrents.includes(hash)) {
      selectTorrent(hash, e);
    }

    if (shouldDisplayTorrentDetails.current) {
      displayTorrentDetails(hash);
    } else {
      shouldDisplayTorrentDetails.current = true;
      setTimeout(() => {
        shouldDisplayTorrentDetails.current = false;
      }, 200);
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
        handleKeyPress={(e) => onKeyPress(hash, e)}
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
      handleKeyPress={(e) => onKeyPress(hash, e)}
    />
  );
});

export default TorrentListRow;
