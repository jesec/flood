import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';

interface Accumulation {
  id: string;
  value: number;
}

export interface Alert {
  id: string;
  accumulation?: Accumulation;
  count?: number;
  duration?: number;
}

const DEFAULT_DURATION = 5 * 1000;

class AlertStoreClass extends BaseStore {
  accumulation: Record<string, number> = {};

  alerts: Record<string, Alert> = {};

  accumulate(alert: Alert) {
    if (alert.accumulation == null) {
      return;
    }

    const {id, value} = alert.accumulation;

    if (this.accumulation[id] == null) {
      this.accumulation[id] = value;
    } else {
      this.accumulation[id] += value;
    }
  }

  add(alert: Alert) {
    alert.duration = alert.duration || DEFAULT_DURATION;
    alert.id = alert.id || `${Date.now()}`;

    this.accumulate(alert);

    this.scheduleCleanse(alert);

    this.alerts[alert.id] = alert;

    this.emit('ALERTS_CHANGE');
  }

  getAlerts() {
    const alertIDs = Object.keys(this.alerts).sort();

    return alertIDs.map((id) => {
      const alert = this.alerts[id];

      if (alert.accumulation) {
        alert.count = this.accumulation[alert.accumulation.id];
      }

      return alert;
    });
  }

  removeExpired(alert: Alert) {
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

    this.emit('ALERTS_CHANGE');
  }

  removeAccumulation(alert: Alert) {
    if (alert.accumulation == null) {
      return;
    }

    const {id, value} = alert.accumulation;

    if (this.accumulation[id] == null) {
      return;
    }

    this.accumulation[id] -= value;
  }

  scheduleCleanse(alert: Alert) {
    setTimeout(this.removeExpired.bind(this, alert), alert.duration);
  }
}

const AlertStore = new AlertStoreClass();

AlertStore.dispatcherID = AppDispatcher.register(() => {
  // do nothing.
});

export default AlertStore;
