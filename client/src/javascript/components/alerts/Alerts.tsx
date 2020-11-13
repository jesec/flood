import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {FC} from 'react';
import {observer} from 'mobx-react';

import Alert from './Alert';
import AlertStore from '../../stores/AlertStore';

const Alerts: FC = observer(() => {
  const {sortedAlerts} = AlertStore;

  return (
    <TransitionGroup>
      {sortedAlerts != null && sortedAlerts.length > 0 ? (
        <CSSTransition classNames="alerts__list" timeout={{enter: 250, exit: 250}}>
          <ul className="alerts__list" key="alerts-list">
            {sortedAlerts.map((alert) => (
              <Alert key={alert.id} id={alert.id} />
            ))}
          </ul>
        </CSSTransition>
      ) : null}
    </TransitionGroup>
  );
});

export default Alerts;
