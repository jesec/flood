import _ from 'lodash';
import classnames from 'classnames';
import React from 'react';

import EventTypes from '../../constants/EventTypes';
import LoadingIndicatorDots from '../icons/LoadingIndicatorDots';
import Modal from './Modal';
import TextboxRepeater from '../forms/TextboxRepeater';
import TorrentActions from '../../actions/TorrentActions';
import TorrentStore from '../../stores/TorrentStore';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = [
  'handleDestinationChange',
  'handleUrlAdd',
  'handleUrlChange',
  'handleUrlRemove',
  'handleAddTorrents',
  'onLatestTorrentLocationChange'
];

export default class AddTorrents extends React.Component {
  constructor() {
    super();

    this.state = {
      addTorrentsError: null,
      destination: null,
      isAddingTorrents: false,
      urlTextboxes: [{value: null}]
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.setState({destination: UIStore.getLatestTorrentLocation()});
  }

  componentDidMount() {
    UIStore.listen(EventTypes.UI_LATEST_TORRENT_LOCATION_CHANGE, this.onLatestTorrentLocationChange);
  }

  componentWillUnmount() {
    UIStore.unlisten(EventTypes.UI_LATEST_TORRENT_LOCATION_CHANGE, this.onLatestTorrentLocationChange);
    UIStore.fetchLatestTorrentLocation();
  }

  dismissModal() {
    UIActions.dismissModal();
  }

  onAddTorrentError() {
    this.setState({
      addTorrentsError: 'There was an error, but I have no idea what happened!',
      isAddingTorrents: false
    });
  }

  onLatestTorrentLocationChange() {
    this.setState({destination: UIStore.getLatestTorrentLocation()});
  }

  handleAddTorrents() {
    this.setState({isAddingTorrents: true});
    let torrentUrls = _.map(this.state.urlTextboxes, 'value');
    TorrentActions.addTorrents(torrentUrls, this.state.destination);
  }

  handleDestinationChange(event) {
    this.setState({destination: event.target.value});
  }

  handleUrlRemove(index) {
    let urlTextboxes = Object.assign([], this.state.urlTextboxes);
    urlTextboxes.splice(index, 1);
    this.setState({urlTextboxes});
  }

  handleUrlAdd(index) {
    let urlTextboxes = Object.assign([], this.state.urlTextboxes);
    urlTextboxes.splice(index + 1, 0, {value: null});
    this.setState({urlTextboxes});
  }

  handleUrlChange(index, value) {
    let urlTextboxes = Object.assign([], this.state.urlTextboxes);
    urlTextboxes[index].value = value;
    this.setState({urlTextboxes});
  }

  render() {
    let error = null;

    if (this.state.addTorrentsError) {
      error = (
        <div className="form__row">
          {this.state.addTorrentsError}
        </div>
      );
    }

    return (
      <div className="form">
        {error}
        <div className="form__row">
          <label className="form__label">
            Torrents
          </label>
          <TextboxRepeater placeholder="Torrent URL"
            handleTextboxAdd={this.handleUrlAdd}
            handleTextboxChange={this.handleUrlChange}
            handleTextboxRemove={this.handleUrlRemove}
            textboxes={this.state.urlTextboxes} />
        </div>
        <div className="form__row">
          <label className="form__label">
            Destination
          </label>
          <input className="textbox"
            onChange={this.handleDestinationChange}
            placeholder="Destination"
            value={this.state.destination}
            type="text" />
        </div>
      </div>
    );
  }
}
