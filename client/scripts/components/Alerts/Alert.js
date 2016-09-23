import {FormattedMessage} from 'react-intl';
import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import Alerts from '../../constants/Alerts';
import CircleCheckmarkIcon from '../Icons/CircleCheckmarkIcon';
import CircleExclamationIcon from '../Icons/CircleExclamationIcon';
import stringUtil from '../../../../shared/util/stringUtil';

export default class Alert extends React.Component {
  render() {
    let icon = <CircleCheckmarkIcon />;
    let alertClasses = classnames('alert', {
      'is-success': this.props.type === 'success',
      'is-error': this.props.type === 'error'
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
              countElement: <span className="alert__count">{this.props.count}</span>
            }}
          />
        </span>
      </li>
    );
  }
}

Alert.defaultProps = {
  count: 0,
  type: 'success'
};

Alert.propTypes = {
  count: React.PropTypes.number,
  id: React.PropTypes.string
};
