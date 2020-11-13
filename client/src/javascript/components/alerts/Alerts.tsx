import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {FC} from 'react';
import {observer} from 'mobx-react';

import Alert from './Alert';
import AlertStore from '../../stores/AlertStore';

const Alerts: FC = observer(() => {
  const {alerts, accumulation} = AlertStore;

  const sortedAlerts = Object.keys(alerts)
    .sort()
    .map((id) => {
      const alert = alerts[id];

      if (alert.accumulation) {
        alert.count = accumulation[alert.accumulation.id];
      }

      return alert;
    });

  return (
    <TransitionGroup>
      {sortedAlerts != null && sortedAlerts.length > 0 ? (
        <CSSTransition classNames="alerts__list" timeout={{enter: 250, exit: 250}}>
          <ul className="alerts__list" key="alerts-list">
            {sortedAlerts.map((alert) => (
              <Alert {...alert} key={alert.id} />
            ))}
          </ul>
        </CSSTransition>
      ) : null}
    </TransitionGroup>
  );
});

export default Alerts;
