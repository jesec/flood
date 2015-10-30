import React from 'react';

import Action from '../components/action-bar/Action';
import { addTorrent, startTorrent, stopTorrent } from '../actions/ClientActions';
import AddTorrent from '../components/action-bar/AddTorrent';
import { setTorrentsSort } from '../actions/UIActions';
import SortDropdown from '../components/action-bar/SortDropdown';
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

  handleStart() {
    this.props.dispatch(startTorrent(this.props.uiStore.torrentList.selected));
  }

  handleStop() {
    this.props.dispatch(stopTorrent(this.props.uiStore.torrentList.selected));
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
