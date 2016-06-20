import {formatMessage, FormattedMessage, injectIntl} from 'react-intl';
import classnames from 'classnames';
import React from 'react';

import EventTypes from '../../../constants/EventTypes';
import SettingsStore from '../../../stores/SettingsStore';

const METHODS_TO_BIND = ['handleDestinationChange'];

class AddTorrentsDestination extends React.Component {
  constructor() {
    super();

    this.state = {
      destination: ''
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    let destination = SettingsStore.getFloodSettings('torrentDestination')
      || '';
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
        <div className="form__column">
          <label className="form__label">
            <FormattedMessage
              id="torrents.add.destination.label"
              defaultMessage="Destination"
            />
          </label>
          <input className={textboxClasses}
            onChange={this.handleDestinationChange}
            placeholder={this.props.intl.formatMessage({
              id: 'torrents.add.destination.placeholder',
              defaultMessage: 'Destination'
            })}
            value={this.state.destination}
            type="text" />
        </div>
      </div>
    );
  }
}

export default injectIntl(AddTorrentsDestination);
