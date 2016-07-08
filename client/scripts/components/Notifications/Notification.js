import {FormattedMessage} from 'react-intl';
import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import CircleCheckmarkIcon from '../Icons/CircleCheckmarkIcon';
import CircleExclamationIcon from '../Icons/CircleExclamationIcon';
import Notifications from '../../constants/Notifications';
import stringUtil from '../../../../shared/util/stringUtil';

export default class Notification extends React.Component {
  render() {
    let icon = <CircleCheckmarkIcon />;
    let notificationClasses = classnames('notification', {
      'is-success': this.props.type === 'success',
      'is-error': this.props.type === 'error'
    });

    if (this.props.type === 'error') {
      icon = <CircleExclamationIcon />;
    }

    return (
      <li className={notificationClasses}>
        {icon}
        <span className="notification__content">
          <FormattedMessage
            id={this.props.id}
            defaultMessage={Notifications[this.props.id]}
            values={{
              count: this.props.count,
              countElement: <span className="notification__count">{this.props.count}</span>
            }}
          />
        </span>
      </li>
    );
  }
}

Notification.defaultProps = {
  count: 0,
  type: 'success'
};

Notification.propTypes = {
  count: React.PropTypes.number,
  id: React.PropTypes.string
};
