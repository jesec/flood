import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import {observer} from 'mobx-react';
import {observable, reaction} from 'mobx';
import {useDropzone} from 'react-dropzone';
import * as React from 'react';

import type {FixedSizeList, ListChildComponentProps} from 'react-window';

import defaultFloodSettings from '@shared/constants/defaultFloodSettings';

import type {FloodSettings} from '@shared/types/FloodSettings';

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

const TorrentDropzone: React.FC<{children: React.ReactNode}> = ({children}: {children: React.ReactNode}) => {
  const handleFileDrop = (files: Array<File>) => {
    const filesData: Array<string> = [];

    const callback = (data: string) => {
      filesData.push(data);

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
  const {getRootProps, isDragActive} = useDropzone({onDrop: handleFileDrop, noClick: true, noKeyboard: true});

  return (
    <div
      {...getRootProps({onClick: (evt) => evt.preventDefault()})}
      className={`dropzone dropzone--with-overlay torrents ${isDragActive ? 'dropzone--is-dragging' : ''}`}>
      {children}
    </div>
  );
};

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

const handleClick = (hash: string, event: React.MouseEvent) => UIActions.handleTorrentClick({hash, event});
const handleDoubleClick = (hash: string) => TorrentListContextMenu.handleDetailsClick(hash);

@observer
class TorrentList extends React.Component<WrappedComponentProps> {
  listHeaderRef: HTMLDivElement | null = null;
  listViewportRef = React.createRef<FixedSizeList>();

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

  handleContextMenuClick = (hash: string, event: React.MouseEvent | React.TouchEvent) => {
    if (event.cancelable === true) {
      event.preventDefault();
    }

    const mouseClientX = ((event as unknown) as MouseEvent).clientX;
    const mouseClientY = ((event as unknown) as MouseEvent).clientY;
    const touchClientX = ((event as unknown) as TouchEvent).touches?.[0].clientX;
    const touchClientY = ((event as unknown) as TouchEvent).touches?.[0].clientY;

    if (!TorrentStore.selectedTorrents.includes(hash)) {
      UIActions.handleTorrentClick({hash, event});
    }

    const {torrentContextMenuActions = defaultFloodSettings.torrentContextMenuActions} = SettingStore.floodSettings;
    const torrent = TorrentStore.torrents[hash];

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

  handleTorrentFilterChange = () => {
    if (this.listViewportRef.current != null) {
      this.listViewportRef.current.scrollTo(0);
    }
  };

  handleViewportScroll = (scrollLeft: number) => {
    if (this.listHeaderRef != null) {
      this.listHeaderRef.scrollLeft = scrollLeft;
    }
  };

  renderListItem: React.FC<ListChildComponentProps> = observer(({index, style}) => {
    const torrent = TorrentStore.filteredTorrents[index];

    return (
      <TorrentListRow
        handleClick={handleClick}
        handleDoubleClick={handleDoubleClick}
        handleRightClick={this.handleContextMenuClick}
        key={torrent.hash}
        style={style}
        hash={torrent.hash}
      />
    );
  });

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

      // itemSize must sync with styles &--is-condensed and &--is-expanded
      content = (
        <ListViewport
          className="torrent__list__viewport"
          itemRenderer={this.renderListItem}
          itemSize={isCondensed ? 30 : 70}
          listLength={torrents.length}
          ref={this.listViewportRef}
          outerRef={(ref) => {
            const viewportDiv = ref;
            if (viewportDiv != null && viewportDiv.onscroll == null) {
              viewportDiv.onscroll = () => {
                this.handleViewportScroll(viewportDiv.scrollLeft);
              };
            }
          }}
        />
      );
    }

    return (
      <TorrentDropzone>
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
      </TorrentDropzone>
    );
  }
}

export default injectIntl(TorrentList);
