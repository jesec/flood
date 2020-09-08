import {CSSTransition, TransitionGroup} from 'react-transition-group';
import React from 'react';

import Alert from './Alert';
import AlertStore from '../../stores/AlertStore';
import connectStores from '../../util/connectStores';

import type {Alert as AlertType} from '../../stores/AlertStore';

interface AlertsProps {
  alerts?: Array<AlertType>;
}

class Alerts extends React.Component<AlertsProps> {
  renderAlerts() {
    const {alerts} = this.props;

    if (alerts != null && alerts.length > 0) {
      return (
        <CSSTransition classNames="alerts__list" timeout={{enter: 250, exit: 250}}>
          <ul className="alerts__list" key="alerts-list">
            {alerts.map((alert) => (
              <Alert {...alert} key={alert.id} />
            ))}
          </ul>
        </CSSTransition>
      );
    }

    return null;
  }

  render() {
    return <TransitionGroup>{this.renderAlerts()}</TransitionGroup>;
  }
}

const ConnectedAlerts = connectStores(Alerts, () => {
  return [
    {
      store: AlertStore,
      event: 'ALERTS_CHANGE',
      getValue: ({store}) => {
        const storeAlert = store as typeof AlertStore;
        return {
          alerts: storeAlert.getAlerts(),
        };
      },
    },
  ];
});

export default ConnectedAlerts;
