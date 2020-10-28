import {makeAutoObservable} from 'mobx';

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

class AlertStore {
  accumulation: Record<string, number> = {};

  alerts: Record<string, Alert> = {};

  constructor() {
    makeAutoObservable(this);
  }

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
    const newAlert: Alert = {
      ...alert,
      id: alert.id || `${Date.now()}`,
      duration: alert.duration || DEFAULT_DURATION,
    };

    this.accumulate(newAlert);

    this.scheduleCleanse(newAlert);

    this.alerts[newAlert.id] = newAlert;
  }

  removeExpired = (alert: Alert) => {
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
  };

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
    setTimeout(() => this.removeExpired(alert), alert.duration);
  }
}

export default new AlertStore();
