import _ from 'lodash';
import classnames from 'classnames';
import React from 'react';

import AddTorrentsDestination from './AddTorrentsDestination';
import LoadingIndicatorDots from '../icons/LoadingIndicatorDots';
import ModalActions from './ModalActions';
import TextboxRepeater from '../forms/TextboxRepeater';
import TorrentActions from '../../actions/TorrentActions';
import UIActions from '../../actions/UIActions';

const METHODS_TO_BIND = [
  'handleUrlAdd',
  'handleUrlChange',
  'handleUrlRemove',
  'handleDestinationChange',
  'handleAddTorrents'
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

  dismissModal() {
    UIActions.dismissModal();
  }

  onAddTorrentError() {
    this.setState({
      addTorrentsError: 'There was an error, but I have no idea what happened!',
      isAddingTorrents: false
    });
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

  handleAddTorrents() {
    this.setState({isAddingTorrents: true});
    let torrentUrls = _.map(this.state.urlTextboxes, 'value');
    TorrentActions.addTorrentsByUrls(torrentUrls, this.state.destination);
  }

  handleDestinationChange(destination) {
    this.setState({destination});
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
        <AddTorrentsDestination onChange={this.handleDestinationChange} />
        <ModalActions actions={this.getActions()} />
      </div>
    );
  }
}
