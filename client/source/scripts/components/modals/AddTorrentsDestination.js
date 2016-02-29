import classnames from 'classnames';
import React from 'react';

import EventTypes from '../../constants/EventTypes';
import UIStore from '../../stores/UIStore';

const METHODS_TO_BIND = [
  'handleDestinationChange',
  'onLatestTorrentLocationChange'
];

export default class AddTorrents extends React.Component {
  constructor() {
    super();

    this.state = {
      destination: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    let destination = UIStore.getLatestTorrentLocation();
    if (this.props.suggested) {
      destination = this.props.suggested;
    }
    this.setState({destination});
  }

  componentDidMount() {
    UIStore.listen(EventTypes.UI_LATEST_TORRENT_LOCATION_CHANGE, this.onLatestTorrentLocationChange);
    UIStore.fetchLatestTorrentLocation();
  }

  componentWillUnmount() {
    UIStore.unlisten(EventTypes.UI_LATEST_TORRENT_LOCATION_CHANGE, this.onLatestTorrentLocationChange);
  }

  handleDestinationChange(event) {
    let destination = event.target.value;

    if (this.props.onChange) {
      this.props.onChange(destination);
    }

    this.setState({destination});
  }

  onLatestTorrentLocationChange() {
    if (this.props.suggested) {
      return;
    }

    let destination = UIStore.getLatestTorrentLocation();

    if (this.props.onChange) {
      this.props.onChange(destination);
    }

    this.setState({destination});
  }

  render() {
    let textboxClasses = classnames('textbox', {
      'is-fulfilled': this.state.destination && this.state.destination !== ''
    });

    return (
      <div className="form__row">
        <label className="form__label">
          Destination
        </label>
        <input className={textboxClasses}
          onChange={this.handleDestinationChange}
          placeholder="Destination"
          value={this.state.destination}
          type="text" />
      </div>
    );
  }
}
