import {Button} from 'flood-ui-kit';
import {FormattedMessage, injectIntl} from 'react-intl';
import _ from 'lodash';
import Dropzone from 'react-dropzone';
import React from 'react';

import ClientStatusStore from '../../stores/ClientStatusStore';
import ConfigStore from '../../stores/ConfigStore';
import connectStores from '../../util/connectStores';
import CustomScrollbars from '../general/CustomScrollbars';
import EventTypes from '../../constants/EventTypes';
import Files from '../icons/Files';
import GlobalContextMenuMountPoint from '../general/GlobalContextMenuMountPoint';
import ListViewport from '../general/ListViewport';
import PriorityMeter from '../general/filesystem/PriorityMeter';
import SettingsStore from '../../stores/SettingsStore';
import TableHeading from './TableHeading';
import Torrent from './Torrent';
import TorrentActions from '../../actions/TorrentActions';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';

const defaultWidth = 100;
const defaultPropWidths = {
  name: 200,
  eta: 100,
};

class TorrentListContainer extends React.Component {
  handleTorrentPriorityChange = null;

  lastScrollLeft = 0;

  state = {
    tableScrollLeft: 0,
    torrentListViewportSize: null,
  };

  componentDidMount() {
    TorrentStore.listen(EventTypes.UI_TORRENT_SELECTION_CHANGE, this.handleTorrentSelectionChange);
    TorrentFilterStore.listen(EventTypes.UI_TORRENTS_FILTER_CHANGE, this.handleTorrentFilterChange);
    global.addEventListener('resize', this.updateTorrentListViewWidth);
  }

  componentWillUpdate(nextProps) {
    const {torrentListViewSize} = this.props;
    if (nextProps.torrentListViewSize !== torrentListViewSize && this.listViewportRef != null) {
      this.listViewportRef.measureItemHeight();
    }
  }

  componentDidUpdate(prevProps) {
    const {torrentListViewSize} = this.props;
    const isCondensed = torrentListViewSize === 'condensed';
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
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.UI_TORRENT_SELECTION_CHANGE, this.handleTorrentSelectionChange);
    TorrentFilterStore.unlisten(EventTypes.UI_TORRENTS_FILTER_CHANGE, this.handleTorrentFilterChange);
    global.removeEventListener('resize', this.updateTorrentListViewWidth);
  }

  handleClearFiltersClick() {
    TorrentFilterStore.clearAllFilters();
  }

  getContextMenuItems(torrent) {
    const {intl} = this.props;
    const clickHandler = this.handleContextMenuItemClick;

    return [
      {
        action: 'start',
        clickHandler,
        label: intl.formatMessage({
          id: 'torrents.list.context.start',
          defaultMessage: 'Start',
        }),
      },
      {
        action: 'stop',
        clickHandler,
        label: intl.formatMessage({
          id: 'torrents.list.context.stop',
          defaultMessage: 'Stop',
        }),
      },
      {
        action: 'remove',
        clickHandler,
        label: intl.formatMessage({
          id: 'torrents.list.context.remove',
          defaultMessage: 'Remove',
        }),
      },
      {
        action: 'check-hash',
        clickHandler,
        label: intl.formatMessage({
          id: 'torrents.list.context.check.hash',
          defaultMessage: 'Check Hash',
        }),
      },
      {
        type: 'separator',
      },
      {
        action: 'set-taxonomy',
        clickHandler,
        label: intl.formatMessage({
          id: 'torrents.list.context.set.tags',
          defaultMessage: 'Set Tags',
        }),
      },
      {
        action: 'move',
        clickHandler,
        label: intl.formatMessage({
          id: 'torrents.list.context.move',
          defaultMessage: 'Set Torrent Location',
        }),
      },
      {
        type: 'separator',
      },
      {
        action: 'torrent-details',
        clickHandler: (action, event) => {
          clickHandler(action, event, torrent);
        },
        label: intl.formatMessage({
          id: 'torrents.list.context.details',
          defaultMessage: 'Torrent Details',
        }),
      },
      {
        action: 'torrent-download-tar',
        clickHandler: (action, event) => {
          clickHandler(action, event, torrent);
        },
        label: intl.formatMessage({
          id: 'torrents.list.context.download',
          defaultMessage: 'Download',
        }),
      },
      {
        action: 'set-priority',
        clickHandler,
        dismissMenu: false,
        label: intl.formatMessage({
          id: 'torrents.list.context.priority',
          defaultMessage: 'Priority',
        }),
        labelAction: (
          <PriorityMeter
            id={torrent.hash}
            key={torrent.hash}
            bindExternalChangeHandler={this.bindExternalPriorityChangeHandler}
            level={torrent.priority}
            maxLevel={3}
            priorityType="torrent"
            onChange={this.handleTorrentPriorityChange}
            showLabel={false}
          />
        ),
      },
    ];
  }

  handleContextMenuItemClick = (action, event, torrent) => {
    const selectedTorrents = TorrentStore.getSelectedTorrents();
    switch (action) {
      case 'check-hash':
        TorrentActions.checkHash(selectedTorrents);
        break;
      case 'set-taxonomy':
        UIActions.displayModal({id: 'set-taxonomy'});
        break;
      case 'start':
        TorrentActions.startTorrents(selectedTorrents);
        break;
      case 'stop':
        TorrentActions.stopTorrents(selectedTorrents);
        break;
      case 'remove':
        UIActions.displayModal({id: 'remove-torrents'});
        break;
      case 'move':
        UIActions.displayModal({id: 'move-torrents'});
        break;
      case 'torrent-details':
        this.handleDetailsClick(torrent, event);
        break;
      case 'torrent-download-tar':
        this.handleTorrentDownload(torrent, event);
        break;
      case 'set-priority':
        this.handleTorrentPriorityChange(event);
        break;
      default:
        break;
    }
  };

  handleDetailsClick = (torrent, event) => {
    UIActions.handleDetailsClick({
      hash: torrent.hash,
      event,
    });

    UIActions.displayModal({
      id: 'torrent-details',
      options: {hash: torrent.hash},
    });
  };

  handleTorrentDownload(torrent, event) {
    event.preventDefault();
    const baseURI = ConfigStore.getBaseURI();
    const link = document.createElement('a');
    link.download = torrent.isMultiFile ? `${torrent.name}.tar` : torrent.name;
    link.href = `${baseURI}api/download?hash=${torrent.hash}`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
  }

  handleDoubleClick(torrent, event) {
    this.handleDetailsClick(torrent, event);
  }

  handleContextMenuClick = (torrent, event) => {
    event.preventDefault();

    UIActions.displayContextMenu({
      id: 'torrent-list-item',
      clickPosition: {
        x: event.clientX,
        y: event.clientY,
      },
      items: this.getContextMenuItems(torrent),
    });
  };

  handleFileDrop = files => {
    const destination =
      SettingsStore.getFloodSettings('torrentDestination') || SettingsStore.getClientSettings('directoryDefault') || '';

    const isBasePath = false;

    const start = SettingsStore.getFloodSettings('startTorrentsOnLoad');

    const fileData = new FormData();

    files.forEach(file => {
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
            <FormattedMessage id="torrents.list.clear.filters" defaultMessage="Clear filters" />
          </Button>
        </div>
      );
    }

    return (
      <div className="torrents__alert__wrapper">
        <div className="torrents__alert">
          <FormattedMessage id="torrents.list.no.torrents" defaultMessage="No torrents to display." />
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
          ref={ref => {
            this.verticalScrollbarThumb = ref;
          }}
          role="button"
          tabIndex={0}
        />
      </div>
    );
  };

  bindExternalPriorityChangeHandler = priorityChangeHandler => {
    this.handleTorrentPriorityChange = priorityChangeHandler;
  };

  handleTableHeadingCellClick(slug) {
    const currentSort = TorrentFilterStore.getTorrentsSort();

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

  handleTorrentPriorityChange(hash, level) {
    TorrentActions.setPriority(hash, level);
  }

  handleHorizontalScroll = event => {
    if (this.verticalScrollbarThumb != null) {
      const {clientWidth, scrollLeft, scrollWidth} = event.target;
      this.lastScrollLeft = scrollLeft;
      this.updateVerticalThumbPosition((scrollWidth - clientWidth) * -1 + scrollLeft);
    }
  };

  handleHorizontalScrollStop = () => {
    this.setState({tableScrollLeft: this.lastScrollLeft});
  };

  handlePropWidthChange = newPropWidths => {
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

  updateVerticalThumbPosition = offset => {
    this.verticalScrollbarThumb.style.transform = `translateX(${offset}px)`;
  };

  renderListItem = index => {
    const selectedTorrents = TorrentStore.getSelectedTorrents();
    const {displayedProperties, torrentListViewSize, torrentListColumnWidths, torrents} = this.props;
    const torrent = torrents[index];
    const {hash} = torrent;

    return (
      <Torrent
        defaultPropWidths={defaultPropWidths}
        defaultWidth={defaultWidth}
        handleClick={this.handleTorrentClick}
        handleDetailsClick={this.handleDetailsClick}
        handleDoubleClick={this.handleDoubleClick}
        handleRightClick={this.handleContextMenuClick}
        index={index}
        isCondensed={torrentListViewSize === 'condensed'}
        key={hash}
        columns={displayedProperties}
        propWidths={torrentListColumnWidths}
        selected={selectedTorrents.includes(hash)}
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
            <FormattedMessage id="torrents.list.cannot.connect" defaultMessage="Cannot connect to rTorrent." />
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
          ref={ref => {
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
            sortProp={TorrentFilterStore.getTorrentsSort()}
          />
        );
      }
    }

    return (
      <Dropzone
        activeClassName="dropzone--is-dragging"
        className="dropzone dropzone--with-overlay torrents"
        ref={ref => {
          this.listContainer = ref;
        }}
        onDrop={this.handleFileDrop}
        disableClick
        disablePreview>
        <CustomScrollbars
          className="torrent__list__scrollbars--horizontal"
          onScrollStop={this.handleHorizontalScrollStop}
          nativeScrollHandler={this.handleHorizontalScroll}
          ref={ref => {
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
            <FormattedMessage id="torrents.list.drop" defaultMessage="Drop files here to add them to rTorrent." />
          </div>
        </div>
      </Dropzone>
    );
  }
}

const ConnectedActionBar = connectStores(injectIntl(TorrentListContainer), () => {
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

export default ConnectedActionBar;
