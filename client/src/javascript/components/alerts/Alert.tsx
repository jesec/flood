import {FormattedMessage} from 'react-intl';
import classnames from 'classnames';
import React from 'react';

import CircleCheckmarkIcon from '../icons/CircleCheckmarkIcon';
import CircleExclamationIcon from '../icons/CircleExclamationIcon';

interface AlertProps {
  id: string;
  count?: number;
  type?: 'success' | 'error';
}

const Alert: React.FC<AlertProps> = (props: AlertProps) => {
  const {id, count, type} = props;

  const alertClasses = classnames('alert', {
    'is-success': type === 'success',
    'is-error': type === 'error',
  });

  let icon = <CircleCheckmarkIcon />;
  if (type === 'error') {
    icon = <CircleExclamationIcon />;
  }

  return (
    <li className={alertClasses}>
      {icon}
      <span className="alert__content">
        <FormattedMessage
          id={id}
          values={{
            count,
            countElement: <span className="alert__count">{count}</span>,
          }}
        />
      </span>
    </li>
  );
};

Alert.defaultProps = {
  count: 0,
  type: 'success',
};

export default Alert;
