import CSSTransitionGroup from 'react-addons-css-transition-group';
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
        <ul className="alerts__list" key="alerts-list">
          {this.props.alerts.map(alert => (
            <Alert {...alert} key={alert.id} />
          ))}
        </ul>
      );
    }

    return null;
  }

  render() {
    return (
      <CSSTransitionGroup
        transitionName="alerts__list"
        transitionEnterTimeout={250}
        transitionLeaveTimeout={250}
        className="alerts">
        {this.renderAlerts()}
      </CSSTransitionGroup>
    );
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
