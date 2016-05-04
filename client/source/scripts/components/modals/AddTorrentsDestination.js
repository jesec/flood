import classnames from 'classnames';
import React from 'react';

import EventTypes from '../../constants/EventTypes';
import SettingsStore from '../../stores/SettingsStore';

const METHODS_TO_BIND = ['handleDestinationChange'];

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
    let destination = SettingsStore.getSettings('torrentDestination');
    if (this.props.suggested) {
      destination = this.props.suggested;
    }
    this.setState({destination});
  }

  handleDestinationChange(event) {
    let destination = event.target.value;

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
