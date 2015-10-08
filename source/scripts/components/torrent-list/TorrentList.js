import React from 'react';
import ReactDOM from 'react-dom';

import Torrent from './Torrent';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

let getTorrentList = function() {
  let torrentList = TorrentStore.getAll();

  return {
    allTorrents: torrentList,
    torrentCount: torrentList.length
  }
}

let getSelectedTorrents = function() {
  return {
    selectedTorrents: UIStore.getSelectedTorrents()
  }
}

let getListPadding = function() {
  return {
    spaceTop: UIStore.getSpaceTop(),
    spaceBottom: UIStore.getSpaceBottom()
  }
}

let getTorrentRange = function() {
  return {
    min: UIStore.getMinTorrentRendered(),
    max: UIStore.getMaxTorrentRendered()
  }
}

const methodsToBind = [
  '_onTorrentStoreChange',
  '_onTorrentSelectionChange',
  '_onViewportPaddingChange',
  '_onScroll',
  '_onWindowResize'
];

export default class TorrentList extends React.Component {

  constructor() {
    super();

    this.state = {
      allTorrents: [],
      selectedTorrents: [],
      torrentCount: 0,
      torrentHeight: 53,
      minTorrentIndex: 0,
      maxTorrentIndex: 4,
      spaceTop: 0,
      spaceBottom: 0
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    TorrentStore.addChangeListener(this._onTorrentStoreChange);
    UIStore.addSelectionChangeListener(this._onTorrentSelectionChange);
    UIStore.addViewportPaddingChangeListener(this._onViewportPaddingChange);
    window.addEventListener('resize', this._onWindowResize);
    this._onWindowResize();
  }

  componentWillUnmount() {
    TorrentStore.removeChangeListener(this._onTorrentStoreChange);
    UIStore.removeSelectionChangeListener(this._onTorrentSelectionChange);
    UIStore.removeViewportPaddingChangeListener(this._onViewportPaddingChange);
    window.removeEventListener('resize', this._onWindowResize);
  }

  render() {

    let torrents = this.state.allTorrents;

    let that = this;

    let torrentList = torrents.map(function(torrent, index) {

      if (index >= that.state.minTorrentIndex && index <= that.state.maxTorrentIndex) {

        let isSelected = false;
        let hash = torrent.hash;

        if (that.state.selectedTorrents.indexOf(hash) > -1) {
          isSelected = true;
        }

        return (
          <Torrent key={hash} data={torrent} selected={isSelected} />
        );
      }

    });

    return (
      <ul className="torrent__list" ref="torrentList" onScroll={this._onScroll}>
        <li className="torrent__spacer torrent__spacer--top" style={{height: this.state.spaceTop + 'px'}}></li>
        {torrentList}
        <li className="torrent__spacer torrent__spacer--bottom" style={{height: this.state.spaceBottom + 'px'}}></li>
      </ul>
    );
  }

  _onTorrentStoreChange() {
    this.setState(getTorrentList);
  }

  _onTorrentSelectionChange() {
    this.setState(getSelectedTorrents);
  }

  _onViewportPaddingChange() {
    let listPadding = getListPadding();
    let torrentRange = getTorrentRange();

    this.setState({
      minTorrentIndex: torrentRange.min,
      maxTorrentIndex: torrentRange.max,
      spaceTop: listPadding.spaceTop,
      spaceBottom: listPadding.spaceBottom
    });
  }

  _onScroll() {
    UIActions.scrollTorrentList(this.state.torrentCount);
  }

  _onWindowResize() {
    UIActions.setViewportHeight(ReactDOM.findDOMNode(this.refs.torrentList).offsetHeight, ReactDOM.findDOMNode(this).scrollTop);
  }

}
