import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';

const DEFAULT_DURATION = 5 * 1000;

class AlertStoreClass extends BaseStore {
  constructor() {
    super();

    this.accumulation = {};
    this.alerts = {};
  }

  accumulate(alert) {
    const {id, value} = alert.accumulation;

    if (this.accumulation[id] == null) {
      this.accumulation[id] = value;
    } else {
      this.accumulation[id] += value;
    }
  }

  add(alert) {
    alert.duration = alert.duration || DEFAULT_DURATION;
    alert.id = alert.id || Date.now();

    if (alert.accumulation) {
      this.accumulate(alert);
    }

    this.scheduleCleanse(alert);

    this.alerts[alert.id] = alert;

    this.emit(EventTypes.ALERTS_CHANGE);
  }

  getAlerts() {
    const alertIDs = Object.keys(this.alerts).sort();

    return alertIDs.map(id => {
      const alert = this.alerts[id];

      if (alert.accumulation) {
        alert.count = this.accumulation[alert.accumulation.id];
      }

      return alert;
    });
  }

  removeExpired(alert) {
    const {accumulation} = alert;

    if (accumulation) {
      this.removeAccumulation(alert);

      if (this.accumulation[accumulation.id] === 0) {
        delete this.accumulation[accumulation.id];
        delete this.alerts[alert.id];
      }
    } else {
      delete this.alerts[alert.id];
    }

    this.emit(EventTypes.ALERTS_CHANGE);
  }

  removeAccumulation(alert) {
    const {id, value} = alert.accumulation;

    if (this.accumulation[id] == null) {
      return;
    }

    this.accumulation[id] -= value;
  }

  scheduleCleanse(alert) {
    setTimeout(this.removeExpired.bind(this, alert), alert.duration);
  }
}

const AlertStore = new AlertStoreClass();

AlertStore.dispatcherID = AppDispatcher.register(() => {});

export default AlertStore;
