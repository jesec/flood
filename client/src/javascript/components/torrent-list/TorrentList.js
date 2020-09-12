import {FormattedMessage, injectIntl} from 'react-intl';
import _ from 'lodash';
import Dropzone from 'react-dropzone';
import React from 'react';

import {Button} from '../../ui';
import ClientStatusStore from '../../stores/ClientStatusStore';
import connectStores from '../../util/connectStores';
import CustomScrollbars from '../general/CustomScrollbars';
import EventTypes from '../../constants/EventTypes';
import Files from '../icons/Files';
import GlobalContextMenuMountPoint from '../general/GlobalContextMenuMountPoint';
import ListViewport from '../general/ListViewport';
import SettingsStore from '../../stores/SettingsStore';
import TableHeading from './TableHeading';
import Torrent from './Torrent';
import TorrentActions from '../../actions/TorrentActions';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import TorrentListContextMenu from './TorrentListContextMenu';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

const defaultWidth = 100;
const defaultPropWidths = {
  name: 200,
  eta: 100,
};

class TorrentListContainer extends React.Component {
  lastScrollLeft = 0;

  constructor(props) {
    super(props);
    this.state = {
      tableScrollLeft: 0,
      torrentListViewportSize: null,
    };
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.UI_TORRENT_SELECTION_CHANGE, this.handleTorrentSelectionChange);
    TorrentFilterStore.listen(EventTypes.UI_TORRENTS_FILTER_CHANGE, this.handleTorrentFilterChange);
    global.addEventListener('resize', this.updateTorrentListViewWidth);
  }

  componentDidUpdate(prevProps) {
    const {torrentListViewSize: currentTorrentListViewSize} = this.props;
    const isCondensed = currentTorrentListViewSize === 'condensed';
    const wasCondensed = prevProps.torrentListViewSize === 'condensed';

    if (this.horizontalScrollRef != null && this.state.torrentListViewportSize == null) {
      this.updateTorrentListViewWidth();
    }

    if (this.verticalScrollbarThumb != null) {
      if (!isCondensed && wasCondensed) {
        this.updateVerticalThumbPosition(0);
      } else if (isCondensed) {
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
    TorrentStore.unlisten(EventTypes.UI_TORRENT_SELECTION_CHANGE, this.handleTorrentSelectionChange);
    TorrentFilterStore.unlisten(EventTypes.UI_TORRENTS_FILTER_CHANGE, this.handleTorrentFilterChange);
    global.removeEventListener('resize', this.updateTorrentListViewWidth);
  }

  handleClearFiltersClick() {
    TorrentFilterStore.clearAllFilters();
    TorrentStore.triggerTorrentsFilter();
  }

  handleDoubleClick = (torrent, event) => {
    TorrentListContextMenu.handleDetailsClick(torrent, event);
  };

  handleContextMenuClick = (torrent, event) => {
    event.preventDefault();

    UIActions.displayContextMenu({
      id: 'torrent-list-item',
      clickPosition: {
        x: event.clientX,
        y: event.clientY,
      },
      items: TorrentListContextMenu.getContextMenuItems(this.props.intl, torrent, this.props.torrentContextMenuItems),
    });
  };

  handleFileDrop = (files) => {
    const destination =
      SettingsStore.getFloodSettings('torrentDestination') || SettingsStore.getClientSettings('directoryDefault') || '';

    const isBasePath = false;

    const start = SettingsStore.getFloodSettings('startTorrentsOnLoad');

    const fileData = new FormData();

    files.forEach((file) => {
      fileData.append('torrents', file);
    });

    fileData.append('destination', destination);
    fileData.append('isBasePath', isBasePath);
    fileData.append('start', start);
    fileData.append('tags', '');

    TorrentActions.addTorrentsByFiles(fileData, destination);
  };

  handleTorrentFilterChange = () => {
    if (this.listViewportRef != null) {
      this.listViewportRef.scrollToTop();
    }
  };

  handleTorrentSelectionChange = () => {
    this.forceUpdate();
  };

  getEmptyTorrentListNotification() {
    let clearFilters = null;

    if (TorrentFilterStore.isFilterActive()) {
      clearFilters = (
        <div className="torrents__alert__action">
          <Button onClick={this.handleClearFiltersClick} priority="tertiary">
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
  }

  getCellWidth(slug) {
    const value = this.props.torrentListColumnWidths[slug] || defaultPropWidths[slug] || defaultWidth;

    return value;
  }

  getListWrapperStyle(options = {}) {
    if (options.isCondensed && !options.isListEmpty) {
      const totalCellWidth = this.getTotalCellWidth();

      if (totalCellWidth >= this.state.torrentListViewportSize) {
        return {width: `${totalCellWidth}px`};
      }
    }

    return null;
  }

  getTotalCellWidth() {
    return this.props.displayedProperties.reduce((accumulator, {id, visible}) => {
      if (!visible) {
        return accumulator;
      }

      return accumulator + this.getCellWidth(id);
    }, 0);
  }

  getVerticalScrollbarThumb = (props, onMouseUp) => {
    return (
      <div {...props}>
        <div
          className="scrollbars__thumb scrollbars__thumb--horizontal scrollbars__thumb--surrogate"
          onMouseUp={onMouseUp}
          ref={(ref) => {
            this.verticalScrollbarThumb = ref;
          }}
          role="button"
          tabIndex={0}
        />
      </div>
    );
  };

  handleTableHeadingCellClick(slug) {
    const currentSort = TorrentStore.getTorrentsSort();

    let nextDirection = 'asc';

    if (currentSort.property === slug) {
      nextDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }

    const sortBy = {
      property: slug,
      direction: nextDirection,
    };

    SettingsStore.saveFloodSettings({id: 'sortTorrents', data: sortBy});
    UIActions.setTorrentsSort(sortBy);
  }

  handleTorrentClick(hash, event) {
    UIActions.handleTorrentClick({hash, event});
  }

  handleHorizontalScroll = (event) => {
    if (this.verticalScrollbarThumb != null) {
      const {clientWidth, scrollLeft, scrollWidth} = event.target;
      this.lastScrollLeft = scrollLeft;
      this.updateVerticalThumbPosition((scrollWidth - clientWidth) * -1 + scrollLeft);
    }
  };

  handleHorizontalScrollStop = () => {
    this.setState({tableScrollLeft: this.lastScrollLeft});
  };

  handlePropWidthChange = (newPropWidths) => {
    SettingsStore.saveFloodSettings({
      id: 'torrentListColumnWidths',
      data: {...this.props.torrentListColumnWidths, ...newPropWidths},
    });
  };

  /* eslint-disable react/sort-comp */
  updateTorrentListViewWidth = _.debounce(
    () => {
      if (this.horizontalScrollRef != null) {
        this.setState({
          torrentListViewportSize: this.horizontalScrollRef.scrollbarRef.getClientWidth(),
        });
      }
    },
    100,
    {trailing: true},
  );
  /* eslint-enable react/sort-comp */

  updateVerticalThumbPosition = (offset) => {
    this.verticalScrollbarThumb.style.transform = `translateX(${offset}px)`;
  };

  renderListItem = (index) => {
    const selectedTorrents = TorrentStore.getSelectedTorrents();
    const {displayedProperties, torrentListViewSize, torrentListColumnWidths, torrents} = this.props;
    const torrent = torrents[index];
    const {hash} = torrent;

    return (
      <Torrent
        defaultPropWidths={defaultPropWidths}
        defaultWidth={defaultWidth}
        handleClick={this.handleTorrentClick}
        handleDetailsClick={this.handleDoubleClick}
        handleDoubleClick={this.handleDoubleClick}
        handleRightClick={this.handleContextMenuClick}
        index={index}
        isCondensed={torrentListViewSize === 'condensed'}
        key={hash}
        columns={displayedProperties}
        propWidths={torrentListColumnWidths}
        isSelected={selectedTorrents.includes(hash)}
        torrent={torrent}
      />
    );
  };

  render() {
    const {displayedProperties, torrentListColumnWidths, isClientConnected, torrentListViewSize, torrents} = this.props;
    let content = null;
    let torrentListHeading = null;
    const isCondensed = torrentListViewSize === 'condensed';
    const isListEmpty = torrents.length === 0;
    const listWrapperStyle = this.getListWrapperStyle({
      isCondensed,
      isListEmpty,
    });

    if (!isClientConnected) {
      content = (
        <div className="torrents__alert__wrapper">
          <div className="torrents__alert">
            <FormattedMessage id="torrents.list.cannot.connect" />
          </div>
        </div>
      );
    } else if (isListEmpty) {
      content = this.getEmptyTorrentListNotification();
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
            columns={displayedProperties}
            defaultWidth={defaultWidth}
            defaultPropWidths={defaultPropWidths}
            onCellClick={this.handleTableHeadingCellClick}
            onWidthsChange={this.handlePropWidthChange}
            propWidths={torrentListColumnWidths}
            scrollOffset={this.state.tableScrollLeft}
            sortProp={TorrentStore.getTorrentsSort()}
          />
        );
      }
    }

    return (
      <Dropzone
        onDrop={this.handleFileDrop}
        ref={(ref) => {
          this.listContainer = ref;
        }}>
        {({getRootProps, isDragActive}) => (
          <div
            {...getRootProps({onClick: (evt) => evt.preventDefault()})}
            className={`dropzone dropzone--with-overlay torrents ${isDragActive ? 'dropzone--is-dragging' : ''}`}
            tabIndex="none">
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

const ConnectedTorrentList = connectStores(injectIntl(TorrentListContainer), () => {
  return [
    {
      store: ClientStatusStore,
      event: EventTypes.CLIENT_CONNECTION_STATUS_CHANGE,
      getValue: ({store}) => {
        return {
          isClientConnected: store.getIsConnected(),
        };
      },
    },
    {
      store: SettingsStore,
      event: EventTypes.SETTINGS_CHANGE,
      getValue: ({store}) => {
        return {
          displayedProperties: store.getFloodSettings('torrentDetails'),
          torrentContextMenuItems: store.getFloodSettings('torrentContextMenuItems'),
          torrentListColumnWidths: store.getFloodSettings('torrentListColumnWidths'),
          torrentListViewSize: store.getFloodSettings('torrentListViewSize'),
        };
      },
    },
    {
      store: TorrentStore,
      event: [EventTypes.UI_TORRENTS_LIST_FILTERED, EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS],
      getValue: ({store}) => {
        return {
          torrents: store.getTorrents(),
        };
      },
    },
  ];
});

export default ConnectedTorrentList;
