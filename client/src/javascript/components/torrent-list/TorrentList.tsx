import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import debounce from 'lodash/debounce';
import Dropzone from 'react-dropzone';
import {observer} from 'mobx-react';
import {Scrollbars} from 'react-custom-scrollbars';
import {observable, reaction, runInAction} from 'mobx';
import React from 'react';

import defaultFloodSettings from '@shared/constants/defaultFloodSettings';

import type {FloodSettings} from '@shared/types/FloodSettings';
import type {TorrentProperties} from '@shared/types/Torrent';

import {Button} from '../../ui';
import ClientStatusStore from '../../stores/ClientStatusStore';
import CustomScrollbars from '../general/CustomScrollbars';
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

interface TorrentListStates {
  tableScrollLeft: number;
}

@observer
class TorrentList extends React.Component<WrappedComponentProps, TorrentListStates> {
  listContainer: HTMLDivElement | null = null;
  listViewportRef: ListViewport | null = null;
  horizontalScrollRef: Scrollbars | null = null;
  verticalScrollbarThumb: HTMLDivElement | null = null;
  lastScrollLeft = 0;

  torrentListViewportSize = observable.object<{width: number; height: number}>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  constructor(props: WrappedComponentProps) {
    super(props);

    reaction(
      () => SettingStore.floodSettings.torrentListViewSize,
      (currentTorrentListViewSize, prevTorrentListViewSize) => {
        const isCondensed = currentTorrentListViewSize === 'condensed';
        const wasCondensed = prevTorrentListViewSize === 'condensed';

        if (this.verticalScrollbarThumb != null) {
          if (!isCondensed && wasCondensed) {
            this.updateVerticalThumbPosition(0);
          } else if (isCondensed && this.listContainer != null) {
            this.updateVerticalThumbPosition(
              (SettingStore.totalCellWidth - this.listContainer.clientWidth) * -1 + this.lastScrollLeft,
            );
          }
        }

        if (currentTorrentListViewSize !== prevTorrentListViewSize && this.listViewportRef != null) {
          this.listViewportRef.measureItemHeight();
        }
      },
    );

    reaction(() => TorrentFilterStore.filters, this.handleTorrentFilterChange);

    this.state = {
      tableScrollLeft: 0,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateTorrentListViewSize);
  }

  componentDidUpdate() {
    if (this.horizontalScrollRef != null && this.torrentListViewportSize.width === 0) {
      this.updateTorrentListViewSize();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateTorrentListViewSize);
  }

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
    if (this.listViewportRef != null) {
      this.listViewportRef.scrollToTop();
    }
  };

  getVerticalScrollbarThumb: React.StatelessComponent = (props) => {
    return (
      <div {...props}>
        <div
          className="scrollbars__thumb scrollbars__thumb--horizontal scrollbars__thumb--surrogate"
          ref={(ref) => {
            this.verticalScrollbarThumb = ref;
          }}
          role="button"
          tabIndex={0}
        />
      </div>
    );
  };

  handleHorizontalScroll = (event: React.UIEvent) => {
    if (this.verticalScrollbarThumb != null) {
      const {clientWidth, scrollLeft, scrollWidth} = event.target as HTMLElement;
      this.lastScrollLeft = scrollLeft;
      this.updateVerticalThumbPosition((scrollWidth - clientWidth) * -1 + scrollLeft);
    }
  };

  handleHorizontalScrollStop = () => {
    this.setState({tableScrollLeft: this.lastScrollLeft});
  };

  handleColumnWidthChange = (column: TorrentListColumn, width: number) => {
    const {torrentListColumnWidths = defaultFloodSettings.torrentListColumnWidths} = SettingStore.floodSettings;

    SettingActions.saveSetting('torrentListColumnWidths', {
      ...torrentListColumnWidths,
      [column]: width,
    });
  };

  /* eslint-disable react/sort-comp */
  updateTorrentListViewSize = debounce(
    () => {
      runInAction(() => {
        this.torrentListViewportSize.height = this.horizontalScrollRef?.getClientHeight() || window.innerHeight;
        this.torrentListViewportSize.width = this.horizontalScrollRef?.getClientWidth() || window.innerWidth;
      });
      if (SettingStore.floodSettings.torrentListViewSize === 'condensed') {
        if (this.verticalScrollbarThumb != null && this.listContainer != null) {
          this.updateVerticalThumbPosition(
            (SettingStore.totalCellWidth - this.listContainer.clientWidth) * -1 + this.lastScrollLeft,
          );
        }
      }
    },
    100,
    {trailing: true},
  );
  /* eslint-enable react/sort-comp */

  updateVerticalThumbPosition = (offset: number) => {
    if (this.verticalScrollbarThumb != null) {
      this.verticalScrollbarThumb.style.transform = `translateX(${offset}px)`;
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
      content = (
        <ListViewport
          getVerticalThumb={this.getVerticalScrollbarThumb}
          itemRenderer={this.renderListItem}
          listClass="torrent__list"
          listLength={torrents.length}
          ref={(ref) => {
            this.listViewportRef = ref;
          }}
          scrollContainerClass="torrent__list__scrollbars--vertical"
        />
      );

      if (isCondensed) {
        torrentListHeading = (
          <TableHeading
            scrollOffset={this.state.tableScrollLeft}
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
          />
        );
      }
    }

    const listViewportWidth = this.torrentListViewportSize.width;

    return (
      <Dropzone onDrop={this.handleFileDrop} noClick noKeyboard>
        {({getRootProps, isDragActive}) => (
          <div
            {...getRootProps({onClick: (evt) => evt.preventDefault()})}
            className={`dropzone dropzone--with-overlay torrents ${isDragActive ? 'dropzone--is-dragging' : ''}`}
            ref={(ref) => {
              this.listContainer = ref;
            }}>
            <CustomScrollbars
              className="torrent__list__scrollbars--horizontal"
              onScrollStop={this.handleHorizontalScrollStop}
              nativeScrollHandler={this.handleHorizontalScroll}
              ref={(ref) => {
                this.horizontalScrollRef = ref;
              }}>
              <div
                className="torrent__list__wrapper"
                style={
                  isCondensed && !isListEmpty
                    ? {width: `${Math.max(listViewportWidth, SettingStore.totalCellWidth)}px`}
                    : {}
                }>
                <GlobalContextMenuMountPoint id="torrent-list-item" />
                {torrentListHeading}
                {content}
              </div>
            </CustomScrollbars>

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
