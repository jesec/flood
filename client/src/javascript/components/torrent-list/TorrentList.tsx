import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import debounce from 'lodash/debounce';
import Dropzone from 'react-dropzone';
import {Scrollbars} from 'react-custom-scrollbars';
import React from 'react';

import defaultFloodSettings from '@shared/constants/defaultFloodSettings';

import type {FloodSettings} from '@shared/types/FloodSettings';
import type {TorrentProperties} from '@shared/types/Torrent';

import {Button} from '../../ui';
import ClientStatusStore from '../../stores/ClientStatusStore';
import connectStores from '../../util/connectStores';
import CustomScrollbars from '../general/CustomScrollbars';
import Files from '../icons/Files';
import GlobalContextMenuMountPoint from '../general/GlobalContextMenuMountPoint';
import ListViewport from '../general/ListViewport';
import SettingsStore from '../../stores/SettingsStore';
import TableHeading from './TableHeading';
import TorrentActions from '../../actions/TorrentActions';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import TorrentListContextMenu from './TorrentListContextMenu';
import TorrentListRow from './TorrentListRow';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

import type {TorrentListColumn} from '../../constants/TorrentListColumns';

const getEmptyTorrentListNotification = () => {
  let clearFilters = null;

  if (TorrentFilterStore.isFilterActive()) {
    clearFilters = (
      <div className="torrents__alert__action">
        <Button
          onClick={() => {
            TorrentFilterStore.clearAllFilters();
            TorrentStore.triggerTorrentsFilter();
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
const handleDoubleClick = (torrent: TorrentProperties, event: React.MouseEvent) =>
  TorrentListContextMenu.handleDetailsClick(torrent, event);

interface TorrentListProps extends WrappedComponentProps {
  torrents?: Array<TorrentProperties>;
  torrentListViewSize?: FloodSettings['torrentListViewSize'];
  torrentListColumns?: FloodSettings['torrentListColumns'];
  torrentListColumnWidths?: FloodSettings['torrentListColumnWidths'];
  torrentContextMenuActions?: FloodSettings['torrentContextMenuActions'];
  isClientConnected?: boolean;
}

interface TorrentListStates {
  tableScrollLeft: number;
  torrentListViewportSize: number | null;
}

class TorrentList extends React.Component<TorrentListProps, TorrentListStates> {
  listContainer: HTMLDivElement | null = null;
  listViewportRef: ListViewport | null = null;
  horizontalScrollRef: Scrollbars | null = null;
  verticalScrollbarThumb: HTMLDivElement | null = null;
  lastScrollLeft = 0;

  constructor(props: TorrentListProps) {
    super(props);
    this.state = {
      tableScrollLeft: 0,
      torrentListViewportSize: null,
    };
  }

  componentDidMount() {
    TorrentStore.listen('UI_TORRENT_SELECTION_CHANGE', this.handleTorrentSelectionChange);
    TorrentFilterStore.listen('UI_TORRENTS_FILTER_CHANGE', this.handleTorrentFilterChange);
    global.addEventListener('resize', this.updateTorrentListViewWidth);
  }

  componentDidUpdate(prevProps: TorrentListProps) {
    const {torrentListViewSize: currentTorrentListViewSize} = this.props;
    const isCondensed = currentTorrentListViewSize === 'condensed';
    const wasCondensed = prevProps.torrentListViewSize === 'condensed';

    if (this.horizontalScrollRef != null && this.state.torrentListViewportSize == null) {
      this.updateTorrentListViewWidth();
    }

    if (this.verticalScrollbarThumb != null) {
      if (!isCondensed && wasCondensed) {
        this.updateVerticalThumbPosition(0);
      } else if (isCondensed && this.listContainer != null) {
        this.updateVerticalThumbPosition(
          (this.getTotalCellWidth() - this.listContainer.clientWidth) * -1 + this.lastScrollLeft,
        );
      }
    }

    if (currentTorrentListViewSize !== prevProps.torrentListViewSize && this.listViewportRef != null) {
      this.listViewportRef.measureItemHeight();
    }
  }

  componentWillUnmount() {
    TorrentStore.unlisten('UI_TORRENT_SELECTION_CHANGE', this.handleTorrentSelectionChange);
    TorrentFilterStore.unlisten('UI_TORRENTS_FILTER_CHANGE', this.handleTorrentFilterChange);
    global.removeEventListener('resize', this.updateTorrentListViewWidth);
  }

  getCellWidth(slug: TorrentListColumn) {
    if (this.props.torrentListColumnWidths == null) {
      return defaultFloodSettings.torrentListColumnWidths[slug];
    }

    const value = this.props.torrentListColumnWidths[slug] || defaultFloodSettings.torrentListColumnWidths[slug];

    return value;
  }

  getListWrapperStyle(options: {isCondensed: boolean; isListEmpty: boolean}): React.CSSProperties {
    if (options.isCondensed && !options.isListEmpty) {
      const totalCellWidth = this.getTotalCellWidth();

      if (this.state.torrentListViewportSize != null && totalCellWidth >= this.state.torrentListViewportSize) {
        return {width: `${totalCellWidth}px`};
      }
    }

    return {};
  }

  getTotalCellWidth() {
    const torrentListColumns = this.props.torrentListColumns || defaultFloodSettings.torrentListColumns;

    return torrentListColumns.reduce((accumulator, {id, visible}) => {
      if (!visible) {
        return accumulator;
      }

      return accumulator + this.getCellWidth(id);
    }, 0);
  }

  handleContextMenuClick = (torrent: TorrentProperties, event: React.MouseEvent) => {
    event.preventDefault();

    if (!TorrentStore.getSelectedTorrents().includes(torrent.hash)) {
      UIActions.handleTorrentClick({hash: torrent.hash, event});
    }

    UIActions.displayContextMenu({
      id: 'torrent-list-item',
      clickPosition: {
        x: event.clientX,
        y: event.clientY,
      },
      items: TorrentListContextMenu.getContextMenuItems(this.props.intl, torrent).filter((item) => {
        if (item.type === 'separator') {
          return true;
        }

        const torrentContextMenuActions =
          this.props.torrentContextMenuActions || defaultFloodSettings.torrentContextMenuActions;

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
            SettingsStore.getFloodSetting('torrentDestination') ||
            SettingsStore.getClientSetting('directoryDefault') ||
            '',
          isBasePath: false,
          start: SettingsStore.getFloodSetting('startTorrentsOnLoad'),
        });
      }
    };

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target != null && e.target.result != null && typeof e.target.result === 'string') {
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

  handleTorrentSelectionChange = () => {
    this.forceUpdate();
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
    SettingsStore.setFloodSetting('torrentListColumnWidths', {
      ...(this.props.torrentListColumnWidths || defaultFloodSettings.torrentListColumnWidths),
      [column]: width,
    });
  };

  /* eslint-disable react/sort-comp */
  updateTorrentListViewWidth = debounce(
    () => {
      if (this.horizontalScrollRef != null) {
        this.setState({
          torrentListViewportSize: this.horizontalScrollRef.getClientWidth(),
        });
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
    const {torrentListViewSize, torrents} = this.props;
    const selectedTorrents = TorrentStore.getSelectedTorrents();
    const torrentListColumns = this.props.torrentListColumns || defaultFloodSettings.torrentListColumns;
    const torrentListColumnWidths = this.props.torrentListColumnWidths || defaultFloodSettings.torrentListColumnWidths;

    if (torrents == null) {
      return null;
    }

    const torrent = torrents[index];

    return (
      <TorrentListRow
        handleClick={handleClick}
        handleDoubleClick={handleDoubleClick}
        handleRightClick={this.handleContextMenuClick}
        isCondensed={torrentListViewSize === 'condensed'}
        key={torrent.hash}
        columns={torrentListColumns}
        columnWidths={torrentListColumnWidths}
        isSelected={selectedTorrents.includes(torrent.hash)}
        torrent={torrent}
      />
    );
  };

  render() {
    const {isClientConnected, torrentListViewSize, torrents} = this.props;
    const torrentListColumns = this.props.torrentListColumns || defaultFloodSettings.torrentListColumns;
    const torrentListColumnWidths = this.props.torrentListColumnWidths || defaultFloodSettings.torrentListColumnWidths;

    const isCondensed = torrentListViewSize === 'condensed';
    const isListEmpty = torrents == null || torrents.length === 0;
    const listWrapperStyle = this.getListWrapperStyle({
      isCondensed,
      isListEmpty,
    });

    let content: React.ReactNode = null;
    let torrentListHeading: React.ReactNode = null;
    if (!isClientConnected) {
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
            columns={torrentListColumns}
            columnWidths={torrentListColumnWidths}
            scrollOffset={this.state.tableScrollLeft}
            sortProp={TorrentStore.getTorrentsSort()}
            onCellClick={(property: TorrentListColumn) => {
              const currentSort = TorrentStore.getTorrentsSort();

              let nextDirection: FloodSettings['sortTorrents']['direction'] = 'asc';

              if (currentSort.property === property) {
                nextDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
              }

              const sortBy = {
                property,
                direction: nextDirection,
              };

              SettingsStore.setFloodSetting('sortTorrents', sortBy);
              UIActions.setTorrentsSort(sortBy);
            }}
            onWidthsChange={this.handleColumnWidthChange}
          />
        );
      }
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
            <CustomScrollbars
              className="torrent__list__scrollbars--horizontal"
              onScrollStop={this.handleHorizontalScrollStop}
              nativeScrollHandler={this.handleHorizontalScroll}
              ref={(ref) => {
                this.horizontalScrollRef = ref;
              }}>
              <div className="torrent__list__wrapper" style={listWrapperStyle}>
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

const ConnectedTorrentList = connectStores<Omit<TorrentListProps, 'intl'>, TorrentListStates>(
  injectIntl(TorrentList),
  () => {
    return [
      {
        store: ClientStatusStore,
        event: 'CLIENT_CONNECTION_STATUS_CHANGE',
        getValue: () => {
          return {
            isClientConnected: ClientStatusStore.getIsConnected(),
          };
        },
      },
      {
        store: SettingsStore,
        event: 'SETTINGS_CHANGE',
        getValue: () => {
          return {
            torrentContextMenuActions: SettingsStore.getFloodSetting('torrentContextMenuActions'),
            torrentListColumns: SettingsStore.getFloodSetting('torrentListColumns'),
            torrentListColumnWidths: SettingsStore.getFloodSetting('torrentListColumnWidths'),
            torrentListViewSize: SettingsStore.getFloodSetting('torrentListViewSize'),
          };
        },
      },
      {
        store: TorrentStore,
        event: ['UI_TORRENTS_LIST_FILTERED', 'CLIENT_TORRENTS_REQUEST_SUCCESS'],
        getValue: () => {
          return {
            torrents: TorrentStore.getTorrents(),
          };
        },
      },
    ];
  },
);

export default ConnectedTorrentList;
