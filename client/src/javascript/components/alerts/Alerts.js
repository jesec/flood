import {CSSTransition, TransitionGroup} from 'react-transition-group';
import React from 'react';

import Alert from './Alert';
import AlertStore from '../../stores/AlertStore';
import connectStores from '../../util/connectStores';
import EventTypes from '../../constants/EventTypes';

class Alerts extends React.Component {
  renderAlerts() {
    const {alerts} = this.props;

    if (alerts.length > 0) {
      return (
        <CSSTransition classNames="alerts__list" timeout={{enter: 250, exit: 250}}>
          <ul className="alerts__list" key="alerts-list">
            {this.props.alerts.map((alert) => (
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
      event: EventTypes.ALERTS_CHANGE,
      getValue: ({store}) => {
        return {
          alerts: store.getAlerts(),
        };
      },
    },
  ];
});

export default ConnectedAlerts;
