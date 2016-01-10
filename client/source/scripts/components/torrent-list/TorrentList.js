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
    if (maxTorrentIndex > torrentCount - 1) {
      maxTorrentIndex = torrentCount - 1;
    }

    let hiddenBottom = torrentCount - 1 - maxTorrentIndex;
    let hiddenTop = minTorrentIndex;

    let bottom = maxTorrentIndex <= torrentCount ? hiddenBottom *
      this.state.torrentHeight : 0;
    let top = minTorrentIndex > 0 ? hiddenTop * this.state.torrentHeight : 0;

    return {
      bottom,
      top
    };
  }

  getViewportLimits() {
    let buffer = 10;

    let elementsInView = Math.floor(this.state.viewportHeight /
      this.state.torrentHeight);

    let minTorrentIndex = Math.floor(this.state.scrollPosition /
      this.state.torrentHeight) - buffer;

    let maxTorrentIndex = minTorrentIndex + elementsInView + buffer * 2 + 1;

    if (this.state.torrentCount < maxTorrentIndex) {
      maxTorrentIndex = this.state.torrentCount;
    }

    if (minTorrentIndex < 0) {
      minTorrentIndex = 0;
    }

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
    let torrentListContent = null;

    if (!this.state.torrentRequestSuccess) {
      torrentListContent = <LoadingIndicator />;
    } else {
      let selectedTorrents = TorrentStore.getSelectedTorrents();
      let torrents = this.state.torrents;
      let viewportLimits = this.getViewportLimits();
      let listPadding = this.getListPadding(
        viewportLimits.minTorrentIndex,
        viewportLimits.maxTorrentIndex,
        torrents.length
      );

      let visibleTorrents = torrents.slice(
        viewportLimits.minTorrentIndex,
        viewportLimits.maxTorrentIndex
      );

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

      torrentListContent = (
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
        {torrentListContent}
      </div>
    );
  }

}
