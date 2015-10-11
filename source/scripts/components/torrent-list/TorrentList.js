import React from 'react';
import ReactDOM from 'react-dom';

import Torrent from './Torrent';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

const methodsToBind = [
  'componentDidMount',
  'componentWillUnmount',
  'onTorrentStoreChange',
  'onTorrentSelectionChange',
  'onScroll',
  'onWindowResize',
  'getListPadding',
  'getViewportLimits',
  'setViewportHeight'
];

export default class TorrentList extends React.Component {

  constructor() {
    super();

    this.state = {
      allTorrents: [],
      selectedTorrents: [],
      torrentCount: 0,
      torrentHeight: 64,
      torrentRenderBuffer: 2,
      minTorrentIndex: 0,
      maxTorrentIndex: 4,
      spaceTop: 0,
      spaceBottom: 0,
      scrollPosition: 0,
      viewportHeight: 0
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TorrentStore.addChangeListener(this.onTorrentStoreChange);
    UIStore.addSelectionChangeListener(this.onTorrentSelectionChange);
    window.addEventListener('resize', this.onWindowResize);
    this.setViewportHeight();
  }

  componentWillUnmount() {
    TorrentStore.removeChangeListener(this.onTorrentStoreChange);
    UIStore.removeSelectionChangeListener(this.onTorrentSelectionChange);
    window.removeEventListener('resize', this.onWindowResize);
  }

  onTorrentStoreChange() {
    let allTorrents = TorrentStore.getAll();

    this.setState({
      allTorrents: allTorrents,
      torrentCount: allTorrents.length
    });
  }

  onTorrentSelectionChange() {
    this.setState({
      selectedTorrents: UIStore.getSelectedTorrents()
    });
  }

  onScroll() {
    this.setScrollPosition();
  }

  onWindowResize() {
    this.setViewportHeight();
  }

  getListPadding(minTorrentIndex, maxTorrentIndex, torrentCount) {
    if (maxTorrentIndex > torrentCount - 1) {
      maxTorrentIndex = torrentCount - 1;
    }

    let hiddenBottom = torrentCount - 1 - maxTorrentIndex;
    let hiddenTop = minTorrentIndex;

    let bottom = maxTorrentIndex <= torrentCount ? hiddenBottom * this.state.torrentHeight : 0;
    let top = minTorrentIndex > 0 ? hiddenTop * this.state.torrentHeight : 0;

    return {
      bottom,
      top
    };
  }

  getViewportLimits() {
    let buffer = 3;

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
    let selectedTorrents = this.state.selectedTorrents;
    let torrents = this.state.allTorrents;
    let viewportLimits = this.getViewportLimits();
    let listPadding = this.getListPadding(viewportLimits.minTorrentIndex,
      viewportLimits.maxTorrentIndex,
      torrents.length);

    let torrentList = torrents.map(function(torrent, index) {

      if (index >= viewportLimits.minTorrentIndex && index <= viewportLimits.maxTorrentIndex) {
        let isSelected = false;
        let hash = torrent.hash;

        if (selectedTorrents.indexOf(hash) > -1) {
          isSelected = true;
        }

        return (
          <Torrent key={hash} data={torrent} selected={isSelected} />
        );
      }

    });

    return (
      <ul className="torrent__list" ref="torrentList" onScroll={this.onScroll}>
        <li className="torrent__spacer torrent__spacer--top" style={{height: listPadding.top + 'px'}}></li>
        {torrentList}
        <li className="torrent__spacer torrent__spacer--bottom" style={{height: listPadding.bottom + 'px'}}></li>
      </ul>
    );
  }

}
