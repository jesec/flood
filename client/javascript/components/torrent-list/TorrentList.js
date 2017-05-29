import {defineMessages, formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import _ from 'lodash';
import classNames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';
import ReactDOM from 'react-dom';

import ContextMenu from '../general/ContextMenu';
import CustomScrollbars from '../general/CustomScrollbars';
import EventTypes from '../../constants/EventTypes';
import ListViewport from '../general/ListViewport';
import LoadingIndicator from '../general/LoadingIndicator';
import PriorityLevels from '../../constants/PriorityLevels';
import PriorityMeter from '../general/filesystem/PriorityMeter';
import SettingsStore from '../../stores/SettingsStore';
import TableHeading from './TableHeading';
import Torrent from './Torrent';
import TorrentActions from '../../actions/TorrentActions';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

const MESSAGES = defineMessages({
  torrentListDependency: {
    id: 'dependency.loading.torrent.list',
    defaultMessage: 'Torrent List'
  }
});

const METHODS_TO_BIND = [
  'bindExternalPriorityChangeHandler',
  'getVerticalScrollbarThumb',
  'handleContextMenuItemClick',
  'handleDetailsClick',
  'handleHorizontalScroll',
  'handleHorizontalScrollStop',
  'handlePropWidthChange',
  'handleContextMenuClick',
  'handleSettingsChange',
  'handleTorrentClick',
  'onReceiveTorrentsError',
  'onReceiveTorrentsSuccess',
  'onTorrentFilterChange',
  'onTorrentSelectionChange',
  'updateVerticalThumbPosition',
  'renderListItem',
  'updateTorrentListViewWidth'
];

const defaultWidth = 100;
const defaultPropWidths = {
  name: 200,
  eta: 100
};

class TorrentListContainer extends React.Component {
  constructor(props) {
    super();

    this.lastScrollLeft = 0;
    this.state = {
      displayedProperties: SettingsStore.getFloodSettings('torrentDetails'),
      emptyTorrentList: false,
      floodSettingsFetched: false,
      handleTorrentPriorityChange: null,
      tableScrollLeft: 0,
      torrentCount: 0,
      torrentHeight: null,
      torrentListColumnWidths:
        SettingsStore.getFloodSettings('torrentListColumnWidths'),
      torrentListViewSize:
        SettingsStore.getFloodSettings('torrentListViewSize'),
      torrentListViewportSize: null,
      torrents: [],
      torrentRequestError: false,
      torrentRequestSuccess: false,
      viewportHeight: 0
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    UIStore.registerDependency({
      id: 'torrent-list',
      message: props.intl.formatMessage(MESSAGES.torrentListDependency)
    });

    this.updateTorrentListViewWidth = _.debounce(
      this.updateTorrentListViewWidth,
      100,
      {trailing: true}
    );
  }

  componentDidMount() {
    SettingsStore.listen(
      EventTypes.SETTINGS_CHANGE,
      this.handleSettingsChange
    );
    TorrentStore.listen(
      EventTypes.UI_TORRENT_SELECTION_CHANGE,
      this.onTorrentSelectionChange
    );
    TorrentStore.listen(
      EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS,
      this.onReceiveTorrentsSuccess
    );
    TorrentStore.listen(
      EventTypes.UI_TORRENTS_LIST_FILTERED,
      this.onReceiveTorrentsSuccess
    );
    TorrentStore.listen(
      EventTypes.CLIENT_TORRENTS_REQUEST_ERROR,
      this.onReceiveTorrentsError
    );
    TorrentFilterStore.listen(
      EventTypes.UI_TORRENTS_FILTER_CHANGE,
      this.onTorrentFilterChange
    );
    global.addEventListener('resize', this.updateTorrentListViewWidth);
  }

  componentWillUnmount() {
    SettingsStore.unlisten(
      EventTypes.SETTINGS_CHANGE,
      this.handleSettingsChange
    );
    TorrentStore.unlisten(
      EventTypes.UI_TORRENT_SELECTION_CHANGE,
      this.onTorrentSelectionChange
    );
    TorrentStore.unlisten(
      EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS,
      this.onReceiveTorrentsSuccess
    );
    TorrentStore.unlisten(
      EventTypes.UI_TORRENTS_LIST_FILTERED,
      this.onReceiveTorrentsSuccess
    );
    TorrentStore.unlisten(
      EventTypes.CLIENT_TORRENTS_REQUEST_ERROR,
      this.onReceiveTorrentsError
    );
    TorrentFilterStore.unlisten(
      EventTypes.UI_TORRENTS_FILTER_CHANGE,
      this.onTorrentFilterChange
    );
    global.removeEventListener('resize', this.updateTorrentListViewWidth);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.torrentListViewSize !== this.state.torrentListViewSize
      && this.listViewportRef != null) {
      this.listViewportRef.measureItemHeight();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {torrentListViewSize} = this.state;
    const isCondensed = torrentListViewSize === 'condensed';
    const wasCondensed = prevState.torrentListViewSize === 'condensed';

    if (this.horizontalScrollRef != null
      && this.state.torrentListViewportSize == null) {
      this.updateTorrentListViewWidth();
    }

    if (this.verticalScrollbarThumb != null) {
      if (!isCondensed && wasCondensed) {
        this.updateVerticalThumbPosition(0);
      } else if (isCondensed) {
        this.updateVerticalThumbPosition(
          (this.getTotalCellWidth() - this.listContainer.clientWidth) * -1
          + this.lastScrollLeft
        );
      }
    }
  }

  bindExternalPriorityChangeHandler(eventHandler) {
    this.setState({handleTorrentPriorityChange: eventHandler});
  }

  getContextMenuItems(torrent) {
    let clickHandler = this.handleContextMenuItemClick;

    return [{
      action: 'start',
      clickHandler,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.start',
        defaultMessage: 'Start'
      })
    }, {
      action: 'stop',
      clickHandler,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.stop',
        defaultMessage: 'Stop'
      })
    }, {
      action: 'pause',
      clickHandler,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.pause',
        defaultMessage: 'Pause'
      })
    }, {
      action: 'remove',
      clickHandler,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.remove',
        defaultMessage: 'Remove'
      })
    }, {
      action: 'check-hash',
      clickHandler,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.check.hash',
        defaultMessage: 'Check Hash'
      })
    }, {
      type: 'separator'
    }, {
      action: 'set-taxonomy',
      clickHandler,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.set.tags',
        defaultMessage: 'Set Tags'
      })
    }, {
      action: 'move',
      clickHandler,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.move',
        defaultMessage: 'Set Download Location'
      })
    }, {
      type: 'separator'
    }, {
      action: 'torrent-details',
      clickHandler: (action, event) => {
        clickHandler(action, event, torrent);
      },
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.details',
        defaultMessage: 'Torrent Details'
      })
    }, {
      action: 'set-priority',
      clickHandler,
      dismissMenu: false,
      label: this.props.intl.formatMessage({
        id: 'torrents.list.context.priority',
        defaultMessage: 'Priority'
      }),
      labelAction: (
        <PriorityMeter id={torrent.hash} key={torrent.hash}
          bindExternalChangeHandler={this.bindExternalPriorityChangeHandler}
          level={torrent.priority} maxLevel={3} priorityType="torrent"
          onChange={this.handleTorrentPriorityChange} showLabel={false} />
      )
    }];
  }

  handleContextMenuItemClick(action, event, torrent) {
    let selectedTorrents = TorrentStore.getSelectedTorrents();
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
      case 'pause':
        TorrentActions.pauseTorrents(selectedTorrents);
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
      case 'set-priority':
        this.state.handleTorrentPriorityChange(event);
        break;
    }
  }

  handleDetailsClick(torrent, event) {
    UIActions.handleDetailsClick({
      hash: torrent.hash,
      event
    });

    UIActions.displayModal({
      id: 'torrent-details',
      options: {hash: torrent.hash}
    });
  }

  handleDoubleClick(torrent, event) {
    this.handleDetailsClick(torrent, event);
  }

  handleContextMenuClick(torrent, event) {
    event.preventDefault();

    UIActions.displayContextMenu({
      id: 'torrent-list-item',
      clickPosition: {
        x: event.clientX,
        y: event.clientY
      },
      items: this.getContextMenuItems(torrent)
    });
  }

  handleSettingsChange() {
    this.setState({
      displayedProperties: SettingsStore.getFloodSettings('torrentDetails'),
      floodSettingsFetched: true,
      torrentListColumnWidths:
        SettingsStore.getFloodSettings('torrentListColumnWidths'),
      torrentListViewSize:
        SettingsStore.getFloodSettings('torrentListViewSize')
    });
  }

  handleTableHeadingCellClick(slug, event) {
    const currentSort = TorrentFilterStore.getTorrentsSort();

    let nextDirection = 'asc';

    if (currentSort.property === slug) {
      nextDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }

    const sortBy = {
      property: slug,
      direction: nextDirection
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

  onReceiveTorrentsError() {
    this.setState({torrentRequestError: true, torrentRequestSuccess: false});
  }

  onReceiveTorrentsSuccess() {
    let torrents = TorrentStore.getTorrents();

    this.setState({
      emptyTorrentList: torrents.length === 0,
      torrents,
      torrentCount: torrents.length,
      torrentRequestError: false,
      torrentRequestSuccess: true
    }, () => UIStore.satisfyDependency('torrent-list'));
  }

  onTorrentFilterChange() {
    if (this.listViewportRef != null) {
      this.listViewportRef.scrollToTop();
    }
  }

  onTorrentSelectionChange() {
    this.forceUpdate();
  }

  getEmptyTorrentListNotification() {
    let clearFilters = null;

    if (TorrentFilterStore.isFilterActive()) {
      clearFilters = (
        <div className="torrents__alert__action">
          <button className="button button--small button--deemphasize
            button--inverse" onClick={this.handleClearFiltersClick}>
            <FormattedMessage
              id="torrents.list.clear.filters"
              defaultMessage="Clear Filters"
            />
          </button>
        </div>
      );
    }

    return (
      <div className="torrents__alert__wrapper">
        <div className="torrents__alert">
          <FormattedMessage
            id="torrents.list.no.torrents"
            defaultMessage="No torrents to display."
          />
        </div>
        {clearFilters}
      </div>
    );
  }

  getCellWidth(slug) {
    const value = this.state.torrentListColumnWidths[slug]
      || defaultPropWidths[slug]
      || defaultWidth;

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

  getLoadingIndicator() {
    return <LoadingIndicator />;
  }

  getTotalCellWidth() {
    return this.state.displayedProperties.reduce(
      (accumulator, {id, visible}) => {
        if (!visible) {
          return accumulator;
        }

        return accumulator + this.getCellWidth(id);
      },
      0
    );
  }

  getVerticalScrollbarThumb(props, onMouseUp) {
    return (
      <div {...props}>
        <div className="scrollbars__thumb scrollbars__thumb--horizontal scrollbars__thumb--surrogate"
          onMouseUp={onMouseUp}
          ref={ref => this.verticalScrollbarThumb = ref }/>
      </div>
    );
  }

  handleClearFiltersClick() {
    TorrentFilterStore.clearAllFilters();
  }

  handleHorizontalScroll(event) {
    if (this.verticalScrollbarThumb != null) {
      const {clientWidth, scrollLeft, scrollWidth} = event.target;
      this.lastScrollLeft = scrollLeft;
      this.updateVerticalThumbPosition(
        (scrollWidth - clientWidth) * -1 + scrollLeft
      );
    }
  }

  handleHorizontalScrollStop() {
    this.setState({tableScrollLeft: this.lastScrollLeft});
  }

  handlePropWidthChange(newPropWidths) {
    const nextPropWidths = {...this.state.torrentListColumnWidths, ...newPropWidths};

    SettingsStore.saveFloodSettings({
      id: 'torrentListColumnWidths',
      data: nextPropWidths
    });

    this.setState({torrentListColumnWidths: nextPropWidths});
  }

  renderListItem(index) {
    const selectedTorrents = TorrentStore.getSelectedTorrents();
    const {displayedProperties, torrentListViewSize, torrents} = this.state;
    const torrent = torrents[index];
    const {hash} = torrent;

    return (
      <Torrent defaultPropWidths={defaultPropWidths}
        defaultWidth={defaultWidth}
        handleClick={this.handleTorrentClick}
        handleDetailsClick={this.handleDetailsClick}
        handleDoubleClick={this.handleDoubleClick}
        handleRightClick={this.handleContextMenuClick}
        index={index}
        isCondensed={torrentListViewSize === 'condensed'}
        key={hash}
        columns={this.state.displayedProperties}
        propWidths={this.state.torrentListColumnWidths}
        selected={selectedTorrents.includes(hash)}
        torrent={torrent} />
    );
  }

  updateTorrentListViewWidth() {
    if (this.horizontalScrollRef != null) {
      this.setState({
        torrentListViewportSize:
          this.horizontalScrollRef.refs.scrollbar.getClientWidth()
      });
    }
  }

  updateVerticalThumbPosition(offset) {
    this.verticalScrollbarThumb.style.transform = `translateX(${offset}px)`;
  }

  render() {
    if (!this.state.floodSettingsFetched) {
      return null;
    }

    let content = null;
    let torrentListHeading = null;
    const isCondensed = this.state.torrentListViewSize === 'condensed';
    const isListEmpty = this.state.emptyTorrentList
      || this.state.torrents.length === 0;
    const listWrapperStyle = this.getListWrapperStyle({
      isCondensed,
      isListEmpty
    });

    if (isListEmpty) {
      content = this.getEmptyTorrentListNotification();
    } else if (this.state.torrentRequestSuccess) {
      content = (
        <ListViewport getVerticalThumb={this.getVerticalScrollbarThumb}
          itemRenderer={this.renderListItem}
          listClass="torrent__list"
          listLength={this.state.torrentCount}
          ref={ref => this.listViewportRef = ref}
          scrollContainerClass="torrent__list__scrollbars--vertical" />
      );

      if (isCondensed) {
        torrentListHeading = (
          <TableHeading columns={this.state.displayedProperties}
            defaultWidth={defaultWidth}
            defaultPropWidths={defaultPropWidths}
            onCellClick={this.handleTableHeadingCellClick}
            onWidthsChange={this.handlePropWidthChange}
            propWidths={this.state.torrentListColumnWidths}
            scrollOffset={this.state.tableScrollLeft}
            sortProp={TorrentFilterStore.getTorrentsSort()} />
        );
      }
    } else {
      content = this.getLoadingIndicator();
    }

    return (
      <div className="torrents" ref={ref => this.listContainer = ref}>
        <CustomScrollbars className="torrent__list__scrollbars--horizontal"
          onScrollStop={this.handleHorizontalScrollStop}
          nativeScrollHandler={this.handleHorizontalScroll}
          ref={ref => this.horizontalScrollRef = ref}>
          <div className="torrent__list__wrapper"
            style={listWrapperStyle}>
            <ContextMenu id="torrent-list-item" />
            {torrentListHeading}
            {content}
          </div>
        </CustomScrollbars>
      </div>
    );
  }
}

export default injectIntl(TorrentListContainer);
