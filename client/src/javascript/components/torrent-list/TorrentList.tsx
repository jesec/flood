import {FC, ReactNode, useEffect, useRef} from 'react';
import {FormattedMessage} from 'react-intl';
import {observer} from 'mobx-react';
import {reaction} from 'mobx';

import type {FixedSizeList} from 'react-window';

import {Button} from '@client/ui';
import {Files} from '@client/ui/icons';
import ClientStatusStore from '@client/stores/ClientStatusStore';
import SettingActions from '@client/actions/SettingActions';
import SettingStore from '@client/stores/SettingStore';
import TorrentFilterStore from '@client/stores/TorrentFilterStore';
import TorrentStore from '@client/stores/TorrentStore';

import type {TorrentListColumn} from '@client/constants/TorrentListColumns';

import defaultFloodSettings from '@shared/constants/defaultFloodSettings';

import type {FloodSettings} from '@shared/types/FloodSettings';

import ContextMenuMountPoint from '../general/ContextMenuMountPoint';
import ListViewport from '../general/ListViewport';
import TableHeading from './TableHeading';
import TorrentListDropzone from './TorrentListDropzone';
import TorrentListRow from './TorrentListRow';

const TorrentList: FC = observer(() => {
  const listHeaderRef = useRef<HTMLDivElement>(null);
  const listViewportRef = useRef<FixedSizeList>(null);

  useEffect(() => {
    const dispose = reaction(
      () => TorrentFilterStore.filters,
      () => {
        if (listViewportRef.current != null) {
          listViewportRef.current.scrollTo(0);
        }
      },
    );

    return dispose;
  }, []);

  const torrents = TorrentStore.filteredTorrents;
  const {torrentListViewSize = 'condensed'} = SettingStore.floodSettings;

  const isCondensed = torrentListViewSize === 'condensed';
  const isListEmpty = torrents == null || torrents.length === 0;

  let content: ReactNode = null;
  let torrentListHeading: ReactNode = null;
  if (!ClientStatusStore.isConnected) {
    content = (
      <div className="torrents__alert__wrapper">
        <div className="torrents__alert">
          <FormattedMessage id="torrents.list.cannot.connect" />
        </div>
      </div>
    );
  } else if (isListEmpty || torrents == null) {
    content = (
      <div className="torrents__alert__wrapper">
        <div className="torrents__alert">
          <FormattedMessage id="torrents.list.no.torrents" />
        </div>
        {TorrentFilterStore.isFilterActive && (
          <div className="torrents__alert__action">
            <Button
              onClick={() => {
                TorrentFilterStore.clearAllFilters();
              }}
              priority="tertiary">
              <FormattedMessage id="torrents.list.clear.filters" />
            </Button>
          </div>
        )}
      </div>
    );
  } else {
    if (isCondensed) {
      torrentListHeading = (
        <TableHeading
          onCellClick={(property: TorrentListColumn) => {
            const currentSort = SettingStore.floodSettings.sortTorrents;

            let nextDirection: FloodSettings['sortTorrents']['direction'] = 'asc';

            if (currentSort.property === property) {
              nextDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
            }

            const sortBy = {
              property,
              direction: nextDirection,
            };

            SettingActions.saveSetting('sortTorrents', sortBy);
          }}
          onWidthsChange={(column: TorrentListColumn, width: number) => {
            const {torrentListColumnWidths = defaultFloodSettings.torrentListColumnWidths} = SettingStore.floodSettings;

            SettingActions.saveSetting('torrentListColumnWidths', {
              ...torrentListColumnWidths,
              [column]: width,
            });
          }}
          ref={listHeaderRef}
        />
      );
    }

    // itemSize must sync with styles &--is-condensed and &--is-expanded
    content = (
      <ListViewport
        className="torrent__list__viewport"
        itemRenderer={({index, style}) => {
          const {hash} = TorrentStore.filteredTorrents[index];

          return <TorrentListRow key={hash} style={style} hash={hash} />;
        }}
        itemSize={isCondensed ? 30 : 70}
        listLength={torrents.length}
        ref={listViewportRef}
        outerRef={(ref) => {
          const viewportDiv = ref;
          if (viewportDiv != null && viewportDiv.onscroll == null) {
            viewportDiv.onscroll = () => {
              if (listHeaderRef.current != null) {
                listHeaderRef.current.scrollLeft = viewportDiv.scrollLeft;
              }
            };
          }
        }}
      />
    );
  }

  return (
    <TorrentListDropzone>
      <div className="torrent__list__wrapper">
        <ContextMenuMountPoint id="torrent-list-item" />
        {torrentListHeading}
        {content}
      </div>
      <div className="dropzone__overlay">
        <div className="dropzone__copy">
          <div className="dropzone__icon">
            <Files />
          </div>
          <FormattedMessage id="torrents.list.drop" />
        </div>
      </div>
    </TorrentListDropzone>
  );
});

export default TorrentList;
