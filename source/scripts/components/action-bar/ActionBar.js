import React from 'react';

import Action from './Action';
import AddTorrent from './AddTorrent';
import SortDropdown from './SortDropdown';
import TorrentActions from '../../actions/TorrentActions';
import UIStore from '../../stores/UIStore';
import UIActions from '../../actions/UIActions';

const methodsToBind = [
  '_start',
  '_stop',
  '_onUIStoreChange'
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

  componentDidMount() {
    UIStore.addSelectionChangeListener(this._onUIStoreChange);
  }

  componentWillUnmount() {
    TorrentStore.removeChangeListener(this._onUIStoreChange);
  }

  render() {

    return (
      <nav className="action-bar">
        <div className="actions action-bar__item action-bar__item--sort-torrents">
          <SortDropdown />
        </div>
        <div className="actions action-bar__item action-bar__item--torrent-operations">
          <div className="action-bar__group">
            <Action label="Start Torrent" slug="start-torrent" icon="start" clickHandler={this._start} />
            <Action label="Stop Torrent" slug="stop-torrent" icon="stop" clickHandler={this._stop} />
            <Action label="Pause Torrent" slug="pause-torrent" icon="pause" clickHandler={this._pause} />
          </div>
          <div className="action-bar__group">
            <AddTorrent />
          </div>
        </div>
      </nav>
    );
  }

  _pause() {

  }

  _start() {
    TorrentActions.start({
      hash: this.state.selectedTorrents
    });
  }

  _stop() {
    TorrentActions.stop({
      hash: this.state.selectedTorrents
    });
  }

  _onUIStoreChange() {
    this.setState({
      selectedTorrents: UIStore.getSelectedTorrents()
    });
  }

  _onAddTorrent() {
    UIActions.toggleAddTorrentModal();
  }

}
