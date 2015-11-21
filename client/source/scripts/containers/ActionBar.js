import {connect} from 'react-redux';
import React from 'react';

import Action from '../components/action-bar/Action';
import {addTorrent, startTorrent, stopTorrent} from '../actions/ClientActions';
import {displayModal} from '../actions/UIActions';
import {setTorrentsSort} from '../actions/UIActions';
import SortDropdown from '../components/action-bar/SortDropdown';
import uiSelector from '../selectors/uiSelector';

const methodsToBind = [
  'handleAddTorrents',
  'handleSortChange',
  'handleStart',
  'handleStop'
];

class ActionBar extends React.Component {

  constructor() {
    super();

    this.state = {
      selectedTorrents: []
    };

    methodsToBind.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleAddTorrents() {
    this.props.dispatch(displayModal({
      modal: 'add-torrents'
    }));
  }

  handleSortChange(sortBy) {
    this.props.dispatch(setTorrentsSort({
      sortBy
    }));
  }

  handleStart() {
    this.props.dispatch(startTorrent(this.props.torrentList.selected));
  }

  handleStop() {
    this.props.dispatch(stopTorrent(this.props.torrentList.selected));
  }

  render() {
    return (
      <nav className="action-bar">
        <div className="actions action-bar__item action-bar__item--sort-torrents">
          <SortDropdown onSortChange={this.handleSortChange}
            selectedItem={this.props.torrentList.sortBy} />
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
          <div className="action-bar__group action-bar__group--has-divider">
            <Action label="Add Torrent" slug="add-torrent" icon="add"
              clickHandler={this.handleAddTorrents} />
          </div>
        </div>
      </nav>
    );
  }

}

export default connect(uiSelector)(ActionBar);
