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

const METHODS_TO_BIND = [
  'bindExternalPriorityChangeHandler',
  'getListPadding',
  'getViewportLimits',
  'handleContextMenuItemClick',
  'handleDetailsClick',
  'handleRightClick',
  'handleTorrentClick',
  'onContextMenuChange',
  'onEmptyTorrentResponse',
  'onReceiveTorrentsError',
  'onReceiveTorrentsSuccess',
  'onTorrentFilterChange',
  'onTorrentSelectionChange',
  'setScrollPosition',
  'setViewportHeight'
];

export default class TorrentListContainer extends React.Component {
  constructor() {
    super();

    this.state = {
      emptyTorrentList: false,
      handleTorrentPriorityChange: null,
      contextMenu: null,
      maxTorrentIndex: 10,
      minTorrentIndex: 0,
      scrollPosition: 0,
      torrentCount: 0,
      torrentHeight: 72,
      torrents: [],
      torrentRequestError: false,
      torrentRequestSuccess: false,
      viewportHeight: 0
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.setScrollPosition = _.throttle(this.setScrollPosition, 100, {
      leading: true,
      trailing: true
    });

    this.handleWindowResize = _.throttle(this.setViewportHeight, 350, {
      leading: true,
      trailing: true
    });
  }

  componentDidMount() {
    UIStore.registerDependency('torrent-list');
    TorrentStore.listen(EventTypes.UI_TORRENT_SELECTION_CHANGE, this.onTorrentSelectionChange);
    TorrentStore.listen(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS, this.onReceiveTorrentsSuccess);
    TorrentStore.listen(EventTypes.CLIENT_TORRENTS_REQUEST_ERROR, this.onReceiveTorrentsError);
    TorrentStore.listen(EventTypes.CLIENT_TORRENTS_EMPTY, this.onEmptyTorrentResponse);
    TorrentFilterStore.listen(EventTypes.UI_TORRENTS_FILTER_CHANGE, this.onTorrentFilterChange);
    UIStore.listen(EventTypes.UI_CONTEXT_MENU_CHANGE, this.onContextMenuChange);
    TorrentStore.fetchTorrents();
    window.addEventListener('resize', this.handleWindowResize);
    this.setViewportHeight();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
    TorrentStore.unlisten(EventTypes.UI_TORRENT_SELECTION_CHANGE, this.onTorrentSelectionChange);
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS, this.onReceiveTorrentsSuccess);
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENTS_REQUEST_ERROR, this.onReceiveTorrentsError);
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENTS_EMPTY, this.onEmptyTorrentResponse);
    TorrentFilterStore.unlisten(EventTypes.UI_TORRENTS_FILTER_CHANGE, this.onTorrentFilterChange);
    UIStore.unlisten(EventTypes.UI_CONTEXT_MENU_CHANGE, this.onContextMenuChange);
  }

  bindExternalPriorityChangeHandler(eventHandler) {
    this.setState({handleTorrentPriorityChange: eventHandler});
  }

  getContextMenuItems(torrent) {
    let clickHandler = this.handleContextMenuItemClick;

    return [{
      action: 'start',
      clickHandler,
      label: 'Start'
    }, {
      action: 'stop',
      clickHandler,
      label: 'Stop'
    }, {
      action: 'pause',
      clickHandler,
      label: 'Pause'
    }, {
      action: 'remove',
      clickHandler,
      label: 'Remove'
    }, {
      action: 'check-hash',
      clickHandler,
      label: 'Check Hash'
    }, {
      type: 'separator'
    }, {
      action: 'move',
      clickHandler,
      label: 'Download Location...'
    }, {
      action: 'set-priority',
      clickHandler,
      dismissMenu: false,
      label: 'Priority',
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
        TorrentActions.deleteTorrents(selectedTorrents);
        break;
      case 'move':
        this.handleContextMenuMoveClick(selectedTorrents);
        break;
      case 'set-priority':
        this.state.handleTorrentPriorityChange(event);
        break;
    }
  }

  handleContextMenuMoveClick(hashes) {
    UIActions.displayModal({id: 'move-torrents'});
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

  onEmptyTorrentResponse() {
    this.setState({
      emptyTorrentList: true,
      torrentRequestError: false,
      torrentRequestSuccess: true
    });

    if (!UIStore.hasSatisfiedDependencies()) {
      UIStore.satisfyDependency('torrent-list');
    }
  }

  onReceiveTorrentsError() {
    this.setState({torrentRequestError: true, torrentRequestSuccess: false});
  }

  onReceiveTorrentsSuccess() {
    let torrents = TorrentStore.getTorrents();

    this.setState({
      torrents,
      torrentCount: torrents.length,
      torrentRequestError: false,
      torrentRequestSuccess: true
    });

    if (!UIStore.hasSatisfiedDependencies()) {
      UIStore.satisfyDependency('torrent-list');
    }
  }

  onTorrentFilterChange() {
    this.forceUpdate();
  }

  onTorrentSelectionChange() {
    this.forceUpdate();
  }

  getEmptyTorrentListNotification() {
    return (
      <div className="torrents__notification__wrapper">
        <div className="torrents__notification">
          No torrents to display.
        </div>
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
    let offset = 10;

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

  setScrollPosition(scrollValues) {
    this.setState({scrollPosition: scrollValues.scrollTop});
  }

  setViewportHeight() {
    if (this.refs.torrentList) {
      this.setState({
        viewportHeight: this.refs.torrentList.refs.scrollbar.getClientHeight()
      });
    }
  }

  render() {
    let content = this.getLoadingIndicator();

    if (this.state.torrentRequestSuccess) {
      let contextMenu = null;
      let selectedTorrents = TorrentStore.getSelectedTorrents();
      let torrents = this.state.torrents;
      let viewportLimits = this.getViewportLimits();

      let listPadding = this.getListPadding(
        viewportLimits.minTorrentIndex,
        viewportLimits.maxTorrentIndex,
        torrents.length
      );

      let maxTorrentIndex = viewportLimits.maxTorrentIndex;
      let minTorrentIndex = viewportLimits.minTorrentIndex;

      if (minTorrentIndex < 0) {
        minTorrentIndex = 0;
      }

      if (this.state.contextMenu != null) {
        contextMenu = (
          <ContextMenu clickPosition={this.state.contextMenu.clickPosition}
            items={this.state.contextMenu.items} />
        );
      }

      let visibleTorrents = torrents.slice(minTorrentIndex, maxTorrentIndex);

      let torrentList = visibleTorrents.map((torrent, index) => {
        let isSelected = false;
        let hash = torrent.hash;

        if (selectedTorrents.indexOf(hash) > -1) {
          isSelected = true;
        }

        return (
          <Torrent key={hash} torrent={torrent} selected={isSelected}
            handleClick={this.handleTorrentClick}
            handleRightClick={this.handleRightClick}
            handleDetailsClick={this.handleDetailsClick} />
        );
      });

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
    }

    if (this.state.emptyTorrentList) {
      content = this.getEmptyTorrentListNotification();
    }

    return (
      <div className="torrent__list__wrapper">
        <CustomScrollbars className="torrent__list__wrapper--custom-scroll"
          ref="torrentList" scrollHandler={this.setScrollPosition}>
          {content}
        </CustomScrollbars>
      </div>
    );
  }

}
