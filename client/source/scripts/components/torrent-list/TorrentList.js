import _ from 'lodash';
import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import EventTypes from '../../constants/EventTypes';
import LoadingIndicator from '../generic/LoadingIndicator';
import Torrent from './Torrent';
import TorrentDetails from './TorrentDetails';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = [
  'onReceiveTorrentsError',
  'onReceiveTorrentsSuccess',
  'handleDetailsClick',
  'handleTorrentClick',
  'onStatusFilterChange',
  'onTorrentSelectionChange',
  'getListPadding',
  'getViewportLimits',
  'setScrollPosition',
  'setViewportHeight'
];

export default class TorrentListContainer extends React.Component {
  constructor() {
    super();

    this.state = {
      maxTorrentIndex: 10,
      minTorrentIndex: 0,
      scrollPosition: 0,
      torrentCount: 0,
      torrentHeight: 64,
      torrents: null,
      torrentRequestError: false,
      torrentRequestSuccess: false,
      viewportHeight: 0
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.handleScroll = _.throttle(this.setScrollPosition, 100, {
      leading: true,
      trailing: true
    });

    this.handleWindowResize = _.throttle(this.setViewportHeight, 350, {
      leading: true,
      trailing: true
    });
  }

  componentDidMount() {
    TorrentStore.listen(EventTypes.UI_TORRENT_SELECTION_CHANGE, this.onTorrentSelectionChange);
    TorrentStore.listen(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS, this.onReceiveTorrentsSuccess);
    TorrentStore.listen(EventTypes.CLIENT_TORRENTS_REQUEST_ERROR, this.onReceiveTorrentsError);
    TorrentFilterStore.listen(EventTypes.UI_TORRENTS_FILTER_STATUS_CHANGE, this.onStatusFilterChange);
    TorrentStore.fetchTorrents();
    window.addEventListener('resize', this.handleWindowResize);
    this.setViewportHeight();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);

    TorrentStore.unlisten(EventTypes.UI_TORRENT_SELECTION_CHANGE, this.onTorrentSelectionChange);
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS, this.onReceiveTorrentsSuccess);
    TorrentStore.unlisten(EventTypes.CLIENT_TORRENTS_REQUEST_ERROR, this.onReceiveTorrentsError);
    TorrentFilterStore.unlisten(EventTypes.UI_TORRENTS_FILTER_STATUS_CHANGE, this.onStatusFilterChange);
  }

  handleDetailsClick(torrent, event) {
    UIActions.handleDetailsClick({
      hash: torrent.hash,
      event
    });
  }

  handleTorrentClick(hash, event) {
    UIActions.handleTorrentClick({hash, event});
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
  }

  onStatusFilterChange() {
    this.forceUpdate();
  }

  onTorrentSelectionChange() {
    if (TorrentStore.getSelectedTorrents().length !== 1) {
      UIStore.closeTorrentDetailsPanel();
    }

    this.forceUpdate();
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

  getViewportLimits() {
    // Calculate the number of items that should be rendered based on the height
    // of the viewport. We offset this to render a few more outide of the
    // container's dimensions, which looks nicer when the user scrolls.
    let offset = 10;

    // The number of elements in view is the height of the viewport divided
    // by the height of the elements.
    let elementsInView = Math.floor(this.state.viewportHeight /
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

  setScrollPosition() {
    if (this.refs.torrentList) {
      this.setState({
        scrollPosition: ReactDOM.findDOMNode(this.refs.torrentList).scrollTop
      });
    }
  }

  setViewportHeight() {
    if (this.refs.torrentList) {
      this.setState({
        viewportHeight: ReactDOM.findDOMNode(this.refs.torrentList).offsetHeight
      });
    }
  }

  render() {
    let content = <LoadingIndicator />;

    if (this.state.torrentRequestSuccess) {
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

      let visibleTorrents = torrents.slice(minTorrentIndex, maxTorrentIndex);

      let torrentList = visibleTorrents.map((torrent, index) => {
        let isSelected = false;
        let hash = torrent.hash;

        if (selectedTorrents.indexOf(hash) > -1) {
          isSelected = true;
        }

        return (
          <Torrent key={hash} data={torrent} selected={isSelected}
            handleClick={this.handleTorrentClick}
            handleDetailsClick={this.handleDetailsClick} />
        );
      });

      content = (
        <ul className="torrent__list">
          <li className="torrent__spacer torrent__spacer--top"
            style={{height: `${listPadding.top}px`}}></li>
          {torrentList}
          <li className="torrent__spacer torrent__spacer--bottom"
            style={{height: `${listPadding.bottom}px`}}></li>
        </ul>
      );
    }

    return (
      <div className="torrent__list__wrapper" onScroll={this.handleScroll}
        ref="torrentList">
        {content}
      </div>
    );
  }

}
