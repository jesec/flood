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
    this.setState({destination: UIStore.getLatestTorrentLocation()});
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
    this.setState({destination: UIStore.getLatestTorrentLocation()});
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
