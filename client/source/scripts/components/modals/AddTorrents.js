import _ from 'lodash';
import classnames from 'classnames';
import React from 'react';

import EventTypes from '../../constants/EventTypes';
import Modal from './Modal';
import TextboxRepeater from '../forms/TextboxRepeater';
import TorrentActions from '../../actions/TorrentActions';
import UIActions from '../../actions/UIActions';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = [
  'getContent',
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
      destination: null,
      isExpanded: false,
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

  onLatestTorrentLocationChange() {
    this.setState({destination: UIStore.getLatestTorrentLocation()});
  }

  getActions() {
    return [
      {
        clickHandler: null,
        content: 'Cancel',
        triggerDismiss: true,
        type: 'secondary'
      },
      {
        clickHandler: this.handleAddTorrents,
        content: 'Add Torrent',
        triggerDismiss: true,
        type: 'primary'
      }
    ];
  }

  getContent() {
    return (
      <div className="form">
        <div className="form__row">
          <TextboxRepeater placeholder="Torrent URL"
            handleTextboxAdd={this.handleUrlAdd}
            handleTextboxChange={this.handleUrlChange}
            handleTextboxRemove={this.handleUrlRemove}
            textboxes={this.state.urlTextboxes} />
        </div>
        <div className="form__row">
          <input className="textbox"
            onChange={this.handleDestinationChange}
            placeholder="Destination"
            value={this.state.destination}
            type="text" />
        </div>
      </div>
    );
  }

  handleAddTorrents() {
    let torrentUrls = _.pluck(this.state.urlTextboxes, 'value');
    TorrentActions.addTorrents(torrentUrls, this.state.destination);
  }

  handleDestinationChange(event) {
    this.setState({
      destination: event.target.value
    })
  }

  handleMenuWrapperClick(event) {
    event.stopPropagation();
  }

  handleUrlRemove(index) {
    let urlTextboxes = Object.assign([], this.state.urlTextboxes);
    urlTextboxes.splice(index, 1);
    this.setState({
      urlTextboxes
    });
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
    return (
      <Modal heading="Add Torrents"
        content={this.getContent()}
        actions={this.getActions()}
        dismiss={this.dismissModal} />
    );
  }
}
