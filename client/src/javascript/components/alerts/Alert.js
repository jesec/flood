import {FormattedMessage} from 'react-intl';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Alerts from '../../constants/Alerts';
import CircleCheckmarkIcon from '../icons/CircleCheckmarkIcon';
import CircleExclamationIcon from '../icons/CircleExclamationIcon';

export default class Alert extends React.Component {
  static propTypes = {
    count: PropTypes.number,
    id: PropTypes.string,
  };

  static defaultProps = {
    count: 0,
    type: 'success',
  };

  render() {
    let icon = <CircleCheckmarkIcon />;
    let alertClasses = classnames('alert', {
      'is-success': this.props.type === 'success',
      'is-error': this.props.type === 'error',
    });

    if (this.props.type === 'error') {
      icon = <CircleExclamationIcon />;
    }

    return (
      <li className={alertClasses}>
        {icon}
        <span className="alert__content">
          <FormattedMessage
            id={this.props.id}
            defaultMessage={Alerts[this.props.id]}
            values={{
              count: this.props.count,
              countElement: <span className="alert__count">{this.props.count}</span>,
            }}
          />
        </span>
      </li>
    );
  }
}
