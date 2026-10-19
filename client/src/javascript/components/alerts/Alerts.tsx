import classnames from 'classnames';
import {FC} from 'react';
import {observer} from 'mobx-react-lite';

import {Transition} from '@client/ui';

import Alert from './Alert';
import AlertStore from '../../stores/AlertStore';

const Alerts: FC = observer(() => {
  const {sortedAlerts} = AlertStore;

  return (
    <Transition
      classNamePrefix="alerts__list"
      in={sortedAlerts != null && sortedAlerts.length > 0}
      mountOnEnter
      timeout={{enter: 250, exit: 250}}
      unmountOnExit
    >
      {(transitionClassName) => (
        <ul className={classnames('alerts__list', transitionClassName)}>
          {sortedAlerts.map((alert) => (
            <Alert key={alert.id} id={alert.id} />
          ))}
        </ul>
      )}
    </Transition>
  );
});

export default Alerts;
