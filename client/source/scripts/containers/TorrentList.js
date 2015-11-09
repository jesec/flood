import _ from 'lodash';
import { connect } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import { fetchTorrents } from '../actions/ClientActions';
import { handleTorrentClick } from '../actions/UIActions';
import Torrent from '../components/torrent-list/Torrent';
import torrentSelector from '../selectors/torrentSelector';
import UIActions from '../actions/UIActions';
import uiSelector from '../selectors/uiSelector';

const methodsToBind = [
  'componentDidMount',
  'componentWillUnmount',
  'handleTorrentClick',
  'getListPadding',
  'getTorrents',
  'getViewportLimits',
  'setScrollPosition',
  'setViewportHeight',
  'shouldComponentUpdate'
];

class TorrentList extends React.Component {

  constructor() {
    super();

    this.state = {
      count: 0,
      maxTorrentIndex: 4,
      minTorrentIndex: 0,
      scrollPosition: 0,
      spaceBottom: 0,
      spaceTop: 0,
      torrentCount: 0,
      torrentFetchInterval: null,
      torrentHeight: 64,
      torrentRenderBuffer: 2,
      viewportHeight: 0
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.handleScroll = _.throttle(this.setScrollPosition, 150, {
      leading: true
    });

    this.handleWindowResize = _.throttle(this.setViewportHeight, 350, {
      leading: true
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize);
    this.setViewportHeight();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
    clearInterval(this.state.torrentFetchInterval);
  }

  componentWillMount() {
    let getTorrents = this.getTorrents;

    this.state.torrentFetchInterval = setInterval(function() {
      getTorrents();
    }, 5000);

    getTorrents();
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.isFetching === true) {
      return false;
    } else {
      return true;
    }
  }

  getTorrents() {
    this.props.dispatch(fetchTorrents());
  }

  handleTorrentClick(hash, event) {
    this.props.dispatch(handleTorrentClick({
      hash,
      event,
      torrentList: this.props.torrents
    }));
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

    let maxTorrentIndex = minTorrentIndex + elementsInView + buffer * 2;

    return {
      minTorrentIndex,
      maxTorrentIndex
    };
  }

  setScrollPosition() {
    this.setState({
      scrollPosition: ReactDOM.findDOMNode(this.refs.torrentList).scrollTop
    });
  }

  setViewportHeight() {
    this.setState({
      viewportHeight: ReactDOM.findDOMNode(this.refs.torrentList).offsetHeight
    });
  }

  render() {
    let selectedTorrents = this.props.selectedTorrents;
    let torrents = this.props.torrents;
    let viewportLimits = this.getViewportLimits();
    let listPadding = this.getListPadding(viewportLimits.minTorrentIndex,
      viewportLimits.maxTorrentIndex,
      torrents.length);
    let torrentList = null;

    if (torrents && torrents.length) {
      var self = this;
      torrentList = torrents.map(function(torrent, index) {

        if (index >= viewportLimits.minTorrentIndex &&
            index <= viewportLimits.maxTorrentIndex) {
          let isSelected = false;
          let hash = torrent.hash;

          if (selectedTorrents.indexOf(hash) > -1) {
            isSelected = true;
          }

          return (
            <Torrent key={hash} data={torrent} selected={isSelected}
              handleClick={self.handleTorrentClick} />
          );
        }

      });
    }

    return (
      <ul className="torrent__list" ref="torrentList"
        onScroll={this.handleScroll}>
        <li className="torrent__spacer torrent__spacer--top"
          style={{
            height: listPadding.top + 'px'
          }}></li>
        {torrentList}
        <li className="torrent__spacer torrent__spacer--bottom"
          style={{
            height: listPadding.bottom + 'px'
          }}></li>
      </ul>
    );
  }

}

export default connect(torrentSelector)(TorrentList);
