import {FC, ReactNode, useEffect, useRef} from 'react';
import {observer} from 'mobx-react';
import {reaction} from 'mobx';
import {Trans} from '@lingui/react';

import type {FixedSizeList, ListChildComponentProps} from 'react-window';

import {Button} from '@client/ui';
import {Files} from '@client/ui/icons';
import ClientStatusStore from '@client/stores/ClientStatusStore';
import SettingActions from '@client/actions/SettingActions';
import SettingStore from '@client/stores/SettingStore';
import TorrentFilterStore from '@client/stores/TorrentFilterStore';
import TorrentStore from '@client/stores/TorrentStore';

import SortDirections from '@client/constants/SortDirections';

import type {TorrentListColumn} from '@client/constants/TorrentListColumns';

import defaultFloodSettings from '@shared/constants/defaultFloodSettings';

import ContextMenuMountPoint from '../general/ContextMenuMountPoint';
import ListViewport from '../general/ListViewport';
import TableHeading from './TableHeading';
import TorrentListDropzone from './TorrentListDropzone';
import TorrentListRow from './TorrentListRow';

const TorrentListRowRenderer: FC<ListChildComponentProps> = observer(({index, style}) => (
  <TorrentListRow hash={TorrentStore.filteredTorrents[index].hash} style={style} />
));

const TorrentList: FC = observer(() => {
  const listHeaderRef = useRef<HTMLDivElement>(null);
  const listViewportRef = useRef<FixedSizeList>(null);
  const listViewportOuterRef = useRef<HTMLDivElement | null>(null);

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
          <Trans id="torrents.list.cannot.connect" />
        </div>
      </div>
    );
  } else if (isListEmpty || torrents == null) {
    content = (
      <div className="torrents__alert__wrapper">
        <div className="torrents__alert">
          <Trans id="torrents.list.no.torrents" />
        </div>
        {TorrentFilterStore.isFilterActive && (
          <div className="torrents__alert__action">
            <Button
              onClick={() => {
                TorrentFilterStore.clearAllFilters();
              }}
              priority="tertiary">
              <Trans id="torrents.list.clear.filters" />
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

            let nextDirection = SortDirections[property] ?? 'asc';

            if (currentSort.property === property) {
              nextDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
            }

            const sortBy = {
              property,
              direction: nextDirection,
            };

            SettingActions.saveSetting('sortTorrents', sortBy);

            if (listViewportOuterRef.current != null && listHeaderRef.current != null) {
              listViewportOuterRef.current.scrollLeft = listHeaderRef.current.scrollLeft;
            }
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
        itemCount={torrents.length}
        itemKey={(index) => TorrentStore.filteredTorrents[index].hash}
        itemRenderer={TorrentListRowRenderer}
        itemSize={isCondensed ? 30 : 70}
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
          listViewportOuterRef.current = viewportDiv;
        }}
      />
    );
  }

  return (
    <TorrentListDropzone>
      <div className="torrent__list__wrapper" role="table">
        <ContextMenuMountPoint id="torrent-list-item" />
        {torrentListHeading}
        {content}
      </div>
      <div className="dropzone__overlay">
        <div className="dropzone__copy">
          <div className="dropzone__icon">
            <Files />
          </div>
          <Trans id="torrents.list.drop" />
        </div>
      </div>
    </TorrentListDropzone>
  );
});

export default TorrentList;
