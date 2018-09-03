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
    let {id, value} = alert.accumulation;

    if (this.accumulation[id] == null) {
      this.accumulation[id] = value;
    } else {
      this.accumulation[id] += value;
    }
  }

  add(alert) {
    alert.duration = this.getDuration(alert);
    alert.id = this.getID(alert);

    if (!!alert.accumulation) {
      this.accumulate(alert);
    }

    this.scheduleCleanse(alert);

    this.alerts[alert.id] = alert;

    this.emit(EventTypes.ALERTS_CHANGE);
  }

  getDuration(alert) {
    return alert.duration || DEFAULT_DURATION;
  }

  getAlerts() {
    let alertIDs = Object.keys(this.alerts).sort();

    return alertIDs.map(id => {
      let alert = this.alerts[id];

      if (!!alert.accumulation) {
        alert.count = this.accumulation[alert.accumulation.id];
      }

      return alert;
    });
  }

  getID(alert) {
    return alert.id || Date.now();
  }

  removeExpired(alert) {
    let {accumulation} = alert;

    if (!!accumulation) {
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
    let {id, value} = alert.accumulation;

    if (this.accumulation[id] == null) {
      return;
    }

    this.accumulation[id] -= value;
  }

  scheduleCleanse(alert) {
    setTimeout(this.removeExpired.bind(this, alert), alert.duration);
  }
}

let AlertStore = new AlertStoreClass();

AlertStore.dispatcherID = AppDispatcher.register(payload => {
  // const {action, source} = payload;
  // switch (action.type) {
  // }
});

export default AlertStore;
