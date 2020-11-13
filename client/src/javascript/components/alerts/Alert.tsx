import {FC} from 'react';
import {FormattedMessage} from 'react-intl';
import classnames from 'classnames';
import {observer} from 'mobx-react';

import AlertStore from '../../stores/AlertStore';
import CircleCheckmarkIcon from '../icons/CircleCheckmarkIcon';
import CircleExclamationIcon from '../icons/CircleExclamationIcon';

interface AlertProps {
  id: string;
}

const Alert: FC<AlertProps> = observer((props: AlertProps) => {
  const {id} = props;
  const {count, type} = AlertStore.alerts[id] || {};

  if (id == null || count == null || type == null) {
    return null;
  }

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
});

export default Alert;
