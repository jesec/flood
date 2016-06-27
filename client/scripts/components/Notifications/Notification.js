import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import CircleCheckmarkIcon from '../Icons/CircleCheckmarkIcon';
import CircleExclamationIcon from '../Icons/CircleExclamationIcon';
import stringUtil from '../../../../shared/util/stringUtil';

export default class Notification extends React.Component {
  render() {
    let icon = <CircleCheckmarkIcon />;
    let countText = null;
    let itemText = this.props.subject;
    let notificationClasses = classnames('notification', {
      'is-success': this.props.type === 'success',
      'is-error': this.props.type === 'error'
    });

    if (this.props.type === 'error') {
      icon = <CircleExclamationIcon />;
    }

    if (!!this.props.accumulation && this.props.count !== 1) {
      countText = (
        <span className="notification__count">
          {this.props.count}
        </span>
      );

      itemText = stringUtil.pluralize(itemText, this.props.count);
    }

    return (
      <li className={notificationClasses}>
        {icon}
        <span className="notification__content">
          {this.props.adverb} {this.props.action} {countText} {itemText}.
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
  action: React.PropTypes.string.isRequired,
  adverb: React.PropTypes.string.isRequired,
  subject: React.PropTypes.string.isRequired,
  subject: React.PropTypes.string
};
