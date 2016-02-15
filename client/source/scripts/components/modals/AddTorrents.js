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
  'getContent',
  'handleDestinationChange',
  'handleUrlAdd',
  'handleUrlChange',
  'handleUrlRemove',
  'handleAddTorrents',
  'onAddTorrentSuccess',
  'onLatestTorrentLocationChange'
];

export default class AddTorrents extends React.Component {
  constructor() {
    super();

    this.state = {
      addTorrentsError: null,
      destination: null,
      isExpanded: false,
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
    TorrentStore.listen(EventTypes.CLIENT_ADD_TORRENT_SUCCESS, this.onAddTorrentSuccess);
    UIStore.listen(EventTypes.UI_LATEST_TORRENT_LOCATION_CHANGE, this.onLatestTorrentLocationChange);
  }

  componentWillUnmount() {
    TorrentStore.unlisten(EventTypes.CLIENT_ADD_TORRENT_SUCCESS, this.onAddTorrentSuccess);
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

  onAddTorrentSuccess() {
    this.dismissModal();
  }

  onLatestTorrentLocationChange() {
    this.setState({destination: UIStore.getLatestTorrentLocation()});
  }

  getActions() {
    let icon = null;
    let primaryButtonText = 'Add Torrent';

    if (this.state.isAddingTorrents) {
      icon = <LoadingIndicatorDots viewBox="0 0 32 32" />;
      primaryButtonText = 'Adding...';
    }

    return [
      {
        clickHandler: null,
        content: 'Cancel',
        triggerDismiss: true,
        type: 'secondary'
      },
      {
        clickHandler: this.handleAddTorrents,
        content: (
          <span>
            {icon}
            {primaryButtonText}
          </span>
        ),
        supplementalClassName: icon != null ? 'has-icon' : '',
        triggerDismiss: true,
        type: 'primary'
      }
    ];
  }

  getContent() {
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
    this.setState({isAddingTorrents: true});
    let torrentUrls = _.map(this.state.urlTextboxes, 'value');
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
