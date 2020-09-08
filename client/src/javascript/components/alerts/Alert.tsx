import {FormattedMessage} from 'react-intl';
import classnames from 'classnames';
import React from 'react';

import CircleCheckmarkIcon from '../icons/CircleCheckmarkIcon';
import CircleExclamationIcon from '../icons/CircleExclamationIcon';

interface AlertProps {
  id: string;
  count: number;
  type: 'success' | 'error';
}

export default class Alert extends React.Component<AlertProps> {
  static defaultProps = {
    count: 0,
    type: 'success',
  };

  render() {
    let icon = <CircleCheckmarkIcon />;
    const alertClasses = classnames('alert', {
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
