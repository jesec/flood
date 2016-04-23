import React from 'react';

import AddTorrentsActions from './AddTorrentsActions';
import AddTorrentsDestination from './AddTorrentsDestination';
import TextboxRepeater from '../forms/TextboxRepeater';
import TorrentActions from '../../actions/TorrentActions';

const METHODS_TO_BIND = [
  'handleAddTorrents',
  'handleDestinationChange',
  'handleStartTorrentsToggle',
  'handleUrlAdd',
  'handleUrlChange',
  'handleUrlRemove'
];

export default class AddTorrents extends React.Component {
  constructor() {
    super();

    this.state = {
      addTorrentsError: null,
      destination: null,
      isAddingTorrents: false,
      urlTextboxes: [{value: null}],
      startTorrents: true
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleAddTorrents() {
    this.setState({isAddingTorrents: true});
    let torrentURLs = _.map(this.state.urlTextboxes, 'value');
    TorrentActions.addTorrentsByUrls({
      urls: torrentURLs,
      destination: this.state.destination,
      start: this.state.startTorrents
    });
  }

  handleDestinationChange(destination) {
    this.setState({destination});
  }

  handleStartTorrentsToggle(value) {
    this.setState({startTorrents: value});
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
        <AddTorrentsActions dismiss={this.props.dismissModal}
          onAddTorrentsClick={this.handleAddTorrents}
          onStartTorrentsToggle={this.handleStartTorrentsToggle}
          isAddingTorrents={this.state.isAddingTorrents} />
      </div>
    );
  }
}
