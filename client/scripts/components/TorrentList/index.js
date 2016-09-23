import {defineMessages, formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import _ from 'lodash';
import classNames from 'classnames';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';
import ReactDOM from 'react-dom';

import ContextMenu from '../General/ContextMenu';
import CustomScrollbars from '../General/CustomScrollbars';
import EventTypes from '../../constants/EventTypes';
import LoadingIndicator from '../General/LoadingIndicator';
import PriorityLevels from '../../constants/PriorityLevels';
import PriorityMeter from '../General/Filesystem/PriorityMeter';
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
  'getListPadding',
  'getViewportLimits',
  'handleContextMenuItemClick',
  'handleDetailsClick',
  'handleRightClick',
  'handleScrollStop',
  'handleTorrentClick',
  'onContextMenuChange',
  'onReceiveTorrentsError',
  'onReceiveTorrentsSuccess',
  'onTorrentFilterChange',
  'onTorrentSelectionChange',
  'postponeRerender',
  'setScrollPosition',
  'setViewportHeight'
];

let cachedTorrentList = null;

class TorrentListContainer extends React.Component {
  constructor() {
    super();

    this.lastScrollPosition = 0;
    this.postponedRerender = false;
    this.state = {
      emptyTorrentList: false,
      handleTorrentPriorityChange: null,
      contextMenu: null,
      maxTorrentIndex: 10,
      minTorrentIndex: 0,
      scrollPosition: 0,
      torrentCount: 0,
      torrentHeight: 71,
      torrents: [],
      torrentRequestError: false,
      torrentRequestSuccess: false,
      viewportHeight: 0
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.handleWindowResize = _.debounce(this.setViewportHeight, 250);
    this.postponeRerender = _.debounce(this.postponeRerender, 500);
    this.setScrollPosition = _.throttle(this.setScrollPosition, 250, {
      trailing: true
    });
  }

  componentDidMount() {
    UIStore.registerDependency({
      id: 'torrent-list',
      message: this.props.intl.formatMessage(MESSAGES.torrentListDependency)
    });
    TorrentStore.listen(EventTypes.UI_TORRENT_SELECTION_CHANGE, this.onTorrentSelectionChange);
    TorrentStore.listen(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS, this.onReceiveTorrentsSuccess);
    TorrentStore.listen(EventTypes.UI_TORRENTS_LIST_FILTERED, this.onReceiveTorrentsSuccess);
    TorrentStore.listen(EventTypes.CLIENT_TORRENTS_REQUEST_ERROR, this.onReceiveTorrentsError);
    TorrentFilterStore.listen(EventTypes.UI_TORRENTS_FILTER_CHANGE, this.onTorrentFilterChange);
    UIStore.listen(EventTypes.UI_CONTEXT_MENU_CHANGE, this.onContextMenuChange);
    window.addEventListener('resize', this.handleWindowResize);
    TorrentStore.fetchTorrents();
    this.setViewportHeight();
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.UI_TORRENT_SELECTION_CHANGE, this.onTorrentSelectionChange);
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS, this.onReceiveTorrentsSuccess);
    TorrentStore.unlisten(EventTypes.UI_TORRENTS_LIST_FILTERED, this.onReceiveTorrentsSuccess);
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENTS_REQUEST_ERROR, this.onReceiveTorrentsError);
    TorrentFilterStore.unlisten(EventTypes.UI_TORRENTS_FILTER_CHANGE, this.onTorrentFilterChange);
    UIStore.unlisten(EventTypes.UI_CONTEXT_MENU_CHANGE, this.onContextMenuChange);
    window.removeEventListener('resize', this.handleWindowResize);
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
        defaultMessage: 'Download Location...'
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

  handleContextMenuItemClick(action, event) {
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

  handleRightClick(torrent, event) {
    event.preventDefault();

    UIStore.setActiveContextMenu({
      clickPosition: {
        x: event.clientX,
        y: event.clientY
      },
      items: this.getContextMenuItems(torrent)
    });
  }

  handleTorrentClick(hash, event) {
    UIActions.handleTorrentClick({hash, event});
  }

  handleTorrentPriorityChange(hash, level) {
    TorrentActions.setPriority(hash, level);
  }

  onContextMenuChange() {
    this.setState({contextMenu: UIStore.getActiveContextMenu()});
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
    }, UIStore.satisfyDependency('torrent-list'));
  }

  onTorrentFilterChange() {
    this.forceUpdate();
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

  getListPadding(minTorrentIndex, maxTorrentIndex, torrentCount) {
    // Calculate the number of pixels to pad the visible item list.
    // If the minimum item index is less than 0, then we're already at the top
    // of the list and don't need to render any padding there.
    if (minTorrentIndex < 0) {
      minTorrentIndex = 0;
    }

    if (maxTorrentIndex > torrentCount) {
      maxTorrentIndex = torrentCount;
    }

    let hiddenBottom = torrentCount - maxTorrentIndex;
    let hiddenTop = minTorrentIndex;

    let bottom = hiddenBottom * this.state.torrentHeight;
    let top = hiddenTop * this.state.torrentHeight;

    return {bottom, top};
  }

  getLoadingIndicator() {
    return <LoadingIndicator />;
  }

  getViewportLimits() {
    // Calculate the number of items that should be rendered based on the height
    // of the viewport. We offset this to render a few more outide of the
    // container's dimensions, which looks nicer when the user scrolls.
    let offset = 0;

    if (this.postponedRerender === false
      && !this.refs.torrentList.refs.scrollbar.dragging) {
      offset = 20;
    }

    // The number of elements in view is the height of the viewport divided
    // by the height of the elements.
    let elementsInView = Math.ceil(this.state.viewportHeight /
      this.state.torrentHeight);

    // The minimum item index to render is the number of items above the
    // viewport's current scroll position, minus the offset.
    let minTorrentIndex = Math.floor(this.state.scrollPosition /
      this.state.torrentHeight) - offset;

    // The maximum item index to render is the minimum item rendered, plus the
    // number of items in view, plus double the offset.
    let maxTorrentIndex = minTorrentIndex + elementsInView + offset * 2;

    return {minTorrentIndex, maxTorrentIndex};
  }

  handleClearFiltersClick() {
    TorrentFilterStore.clearAllFilters();
  }

  handleScrollStop() {
    // Force update as soon as scrolling stops.
    this.postponedRerender = false;
    this.forceUpdate();
  }

  postponeRerender() {
    global.requestAnimationFrame(() => {
      this.postponedRerender = false;
      this.forceUpdate();
    });
  }

  setScrollPosition(scrollValues) {
    global.requestAnimationFrame(() => {
      let {scrollTop} = scrollValues;
      this.setState({scrollPosition: scrollTop});
      this.lastScrollPosition = scrollTop;
    });
  }

  setViewportHeight() {
    if (this.refs.torrentList) {
      this.setState({
        viewportHeight: this.refs.torrentList.refs.scrollbar.getClientHeight()
      });
    }
  }

  render() {
    let content = null;

    if (this.state.emptyTorrentList || this.state.torrents.length === 0) {
      content = this.getEmptyTorrentListNotification();
    } else if (this.state.torrentRequestSuccess) {
      let scrollDelta = Math.abs(this.state.scrollPosition -
        this.lastScrollPosition);

      // If the torrent list is cached and the user is scrolling a large amount,
      // or the user is dragging the scroll handle, then we postpone the list's
      // rerender for better FPS.
      if ((cachedTorrentList != null && scrollDelta > 1000)
        || this.refs.torrentList.refs.scrollbar.dragging === true) {
        this.postponedRerender = true;
        content = cachedTorrentList;

        global.requestAnimationFrame(() => {
          this.postponeRerender();
        });
      } else {
        let contextMenu = null;
        let selectedTorrents = TorrentStore.getSelectedTorrents();
        let {minTorrentIndex, maxTorrentIndex} = this.getViewportLimits();
        let {torrents} = this.state;
        let listPadding = this.getListPadding(minTorrentIndex, maxTorrentIndex,
          torrents.length);

        if (minTorrentIndex < 0) {
          minTorrentIndex = 0;
        }

        if (this.state.contextMenu != null) {
          contextMenu = (
            <ContextMenu clickPosition={this.state.contextMenu.clickPosition}
              items={this.state.contextMenu.items} />
          );
        }

        let torrentList = torrents.slice(minTorrentIndex, maxTorrentIndex).map(
          (torrent, index) => {
            let {hash} = torrent;

            return (
              <Torrent key={hash} torrent={torrent}
                selected={selectedTorrents.includes(hash)}
                handleClick={this.handleTorrentClick}
                handleRightClick={this.handleRightClick}
                handleDetailsClick={this.handleDetailsClick} />
            );
          }
        );

        content = (
          <ul className="torrent__list" key="torrent__list">
            <CSSTransitionGroup
              transitionName="menu"
              transitionEnterTimeout={250}
              transitionLeaveTimeout={250}>
              {contextMenu}
            </CSSTransitionGroup>
            <li className="torrent__spacer torrent__spacer--top"
              style={{height: `${listPadding.top}px`}}></li>
            {torrentList}
            <li className="torrent__spacer torrent__spacer--bottom"
              style={{height: `${listPadding.bottom}px`}}></li>
          </ul>
        );

        cachedTorrentList = content;
      }
    } else {
      content = this.getLoadingIndicator();
    }

    return (
      <div className="torrent__list__wrapper">
        <CustomScrollbars className="torrent__list__wrapper--custom-scroll"
          onScrollStop={this.handleScrollStop}
          ref="torrentList" scrollHandler={this.setScrollPosition}>
          {content}
        </CustomScrollbars>
      </div>
    );
  }

}

export default injectIntl(TorrentListContainer);
