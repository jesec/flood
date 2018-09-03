import CSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

import Alert from './Alert';
import AlertStore from '../../stores/AlertStore';
import EventTypes from '../../constants/EventTypes';

const METHODS_TO_BIND = ['handleAlertChange'];

export default class Alerts extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      alerts: [],
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    AlertStore.listen(EventTypes.ALERTS_CHANGE, this.handleAlertChange);
  }

  componentWillUnmount() {
    AlertStore.unlisten(EventTypes.ALERTS_CHANGE, this.handleAlertChange);
  }

  getAlerts() {
    return this.state.alerts.map((alert, index) => {
      return <Alert {...alert} key={index} />;
    });
  }

  handleAlertChange() {
    this.setState({alerts: AlertStore.getAlerts()});
  }

  render() {
    let alerts = null;

    if (this.state.alerts.length > 0) {
      alerts = (
        <ul className="alerts__list" key="alerts-list">
          {this.getAlerts()}
        </ul>
      );
    }

    return (
      <CSSTransitionGroup
        transitionName="alerts__list"
        transitionEnterTimeout={250}
        transitionLeaveTimeout={250}
        className="alerts">
        {alerts}
      </CSSTransitionGroup>
    );
  }
}
