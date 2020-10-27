import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import Dropzone from 'react-dropzone';
import {observer} from 'mobx-react';
import {observable, reaction} from 'mobx';
import React from 'react';

import defaultFloodSettings from '@shared/constants/defaultFloodSettings';

import type {FloodSettings} from '@shared/types/FloodSettings';
import type {TorrentProperties} from '@shared/types/Torrent';

import {Button} from '../../ui';
import ClientStatusStore from '../../stores/ClientStatusStore';
import Files from '../icons/Files';
import GlobalContextMenuMountPoint from '../general/GlobalContextMenuMountPoint';
import ListViewport from '../general/ListViewport';
import SettingActions from '../../actions/SettingActions';
import SettingStore from '../../stores/SettingStore';
import TableHeading from './TableHeading';
import TorrentActions from '../../actions/TorrentActions';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import TorrentListContextMenu from './TorrentListContextMenu';
import TorrentListRow from './TorrentListRow';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

import type {TorrentListColumn} from '../../constants/TorrentListColumns';

const getEmptyTorrentListNotification = (): React.ReactNode => {
  let clearFilters = null;

  if (TorrentFilterStore.isFilterActive) {
    clearFilters = (
      <div className="torrents__alert__action">
        <Button
          onClick={() => {
            TorrentFilterStore.clearAllFilters();
          }}
          priority="tertiary">
          <FormattedMessage id="torrents.list.clear.filters" />
        </Button>
      </div>
    );
  }

  return (
    <div className="torrents__alert__wrapper">
      <div className="torrents__alert">
        <FormattedMessage id="torrents.list.no.torrents" />
      </div>
      {clearFilters}
    </div>
  );
};

const handleClick = (torrent: TorrentProperties, event: React.MouseEvent) =>
  UIActions.handleTorrentClick({hash: torrent.hash, event});
const handleDoubleClick = (torrent: TorrentProperties) => TorrentListContextMenu.handleDetailsClick(torrent);
@observer
class TorrentList extends React.Component<WrappedComponentProps> {
  listContainer: HTMLDivElement | null = null;
  listHeaderRef: HTMLDivElement | null = null;
  listViewportRef = React.createRef<HTMLDivElement>();

  torrentListViewportSize = observable.object<{width: number; height: number}>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  constructor(props: WrappedComponentProps) {
    super(props);

    reaction(() => TorrentFilterStore.filters, this.handleTorrentFilterChange);
  }

  handleColumnWidthChange = (column: TorrentListColumn, width: number) => {
    const {torrentListColumnWidths = defaultFloodSettings.torrentListColumnWidths} = SettingStore.floodSettings;

    SettingActions.saveSetting('torrentListColumnWidths', {
      ...torrentListColumnWidths,
      [column]: width,
    });
  };

  handleContextMenuClick = (torrent: TorrentProperties, event: React.MouseEvent | React.TouchEvent) => {
    if (event.cancelable === true) {
      event.preventDefault();
    }

    const mouseClientX = ((event as unknown) as MouseEvent).clientX;
    const mouseClientY = ((event as unknown) as MouseEvent).clientY;
    const touchClientX = ((event as unknown) as TouchEvent).touches?.[0].clientX;
    const touchClientY = ((event as unknown) as TouchEvent).touches?.[0].clientY;

    if (!TorrentStore.selectedTorrents.includes(torrent.hash)) {
      UIActions.handleTorrentClick({hash: torrent.hash, event});
    }

    const {torrentContextMenuActions = defaultFloodSettings.torrentContextMenuActions} = SettingStore.floodSettings;

    UIActions.displayContextMenu({
      id: 'torrent-list-item',
      clickPosition: {
        x: mouseClientX || touchClientX || 0,
        y: mouseClientY || touchClientY || 0,
      },
      items: TorrentListContextMenu.getContextMenuItems(this.props.intl, torrent).filter((item) => {
        if (item.type === 'separator') {
          return true;
        }

        return !torrentContextMenuActions.some((action) => action.id === item.action && action.visible === false);
      }),
    });
  };

  handleFileDrop = (files: Array<File>) => {
    const filesData: Array<string> = [];

    const callback = (data: string) => {
      filesData.concat(data);

      if (filesData.length === files.length) {
        TorrentActions.addTorrentsByFiles({
          files: filesData,
          destination:
            SettingStore.floodSettings.torrentDestination || SettingStore.clientSettings?.directoryDefault || '',
          isBasePath: false,
          start: SettingStore.floodSettings.startTorrentsOnLoad,
        });
      }
    };

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result != null && typeof e.target.result === 'string') {
          callback(e.target.result.split('base64,')[1]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  handleTorrentFilterChange = () => {
    if (this.listViewportRef.current != null) {
      this.listViewportRef.current.scrollTop = 0;
    }
  };

  handleViewportScroll = () => {
    if (this.listHeaderRef != null && this.listViewportRef.current != null) {
      this.listHeaderRef.scrollLeft = this.listViewportRef.current.scrollLeft;
    }
  };

  renderListItem = (index: number) => {
    const torrent = TorrentStore.filteredTorrents[index];

    return (
      <TorrentListRow
        handleClick={handleClick}
        handleDoubleClick={handleDoubleClick}
        handleRightClick={this.handleContextMenuClick}
        key={torrent.hash}
        hash={torrent.hash}
      />
    );
  };

  render() {
    const torrents = TorrentStore.filteredTorrents;
    const {torrentListViewSize = 'condensed'} = SettingStore.floodSettings;

    const isCondensed = torrentListViewSize === 'condensed';
    const isListEmpty = torrents == null || torrents.length === 0;

    let content: React.ReactNode = null;
    let torrentListHeading: React.ReactNode = null;
    if (!ClientStatusStore.isConnected) {
      content = (
        <div className="torrents__alert__wrapper">
          <div className="torrents__alert">
            <FormattedMessage id="torrents.list.cannot.connect" />
          </div>
        </div>
      );
    } else if (isListEmpty || torrents == null) {
      content = getEmptyTorrentListNotification();
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
            onWidthsChange={this.handleColumnWidthChange}
            setRef={(ref) => {
              this.listHeaderRef = ref;
            }}
          />
        );
      }

      content = (
        <ListViewport
          itemRenderer={this.renderListItem}
          listClass="torrent__list"
          listLength={torrents.length}
          onScroll={this.handleViewportScroll}
          ref={this.listViewportRef}
        />
      );
    }

    return (
      <Dropzone onDrop={this.handleFileDrop} noClick noKeyboard>
        {({getRootProps, isDragActive}) => (
          <div
            {...getRootProps({onClick: (evt) => evt.preventDefault()})}
            className={`dropzone dropzone--with-overlay torrents ${isDragActive ? 'dropzone--is-dragging' : ''}`}
            ref={(ref) => {
              this.listContainer = ref;
            }}>
            <div className="torrent__list__wrapper">
              <GlobalContextMenuMountPoint id="torrent-list-item" />
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
          </div>
        )}
      </Dropzone>
    );
  }
}

export default injectIntl(TorrentList);
