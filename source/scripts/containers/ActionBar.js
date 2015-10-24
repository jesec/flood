import React from 'react';

import Action from '../components/action-bar/Action';
import AddTorrent from '../components/action-bar/AddTorrent';
import { setTorrentsSort } from '../actions/UIActions';
import SortDropdown from '../components/action-bar/SortDropdown';
import TorrentActions from '../actions/TorrentActions';
import UIActions from '../actions/UIActions';

const methodsToBind = [
  'handleSortChange',
  'handleStart',
  'handleStop'
];

export default class FilterBar extends React.Component {

  constructor() {
    super();

    this.state = {
      selectedTorrents: []
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleSortChange(sortBy) {
    this.props.dispatch(setTorrentsSort({
      sortBy
    }));
  }

  handlePause() {

  }

  handleStart() {
    TorrentActions.start({
      hash: this.state.selectedTorrents
    });
  }

  handleStop() {
    TorrentActions.stop({
      hash: this.state.selectedTorrents
    });
  }

  render() {
    return (
      <nav className="action-bar">
        <div className="actions action-bar__item action-bar__item--sort-torrents">
          <SortDropdown onSortChange={this.handleSortChange}
            selectedItem={this.props.uiStore.torrentList.sortBy} />
        </div>
        <div className="actions action-bar__item action-bar__item--torrent-operations">
          <div className="action-bar__group">
            <Action label="Start Torrent" slug="start-torrent" icon="start"
              clickHandler={this.handleStart} />
            <Action label="Stop Torrent" slug="stop-torrent" icon="stop"
              clickHandler={this.handleStop} />
            <Action label="Pause Torrent" slug="pause-torrent" icon="pause"
              clickHandler={this.handlePause} />
          </div>
          <div className="action-bar__group">
            <AddTorrent />
          </div>
        </div>
      </nav>
    );
  }

}
