import {computed, extendObservable, makeAutoObservable} from 'mobx';
import sort from 'fast-sort';

export interface Alert {
  id: string;
  type: 'success' | 'error';
  count?: number;
  duration?: number;
  timer: number;
  updated: number;
}

const DEFAULT_DURATION = 5 * 1000;

class AlertStore {
  alerts: Record<string, Alert> = {};

  @computed get sortedAlerts(): Array<Alert> {
    return sort(Object.values(this.alerts)).asc((alert) => alert.updated);
  }

  constructor() {
    makeAutoObservable(this);
  }

  add(alert: Pick<Alert, 'id' | 'type' | 'count' | 'duration'>) {
    const curAlert = this.alerts[alert.id];

    if (curAlert != null) {
      clearTimeout(curAlert.timer);

      if (alert.count != null) {
        curAlert.count = (curAlert.count ?? 0) + alert.count;
      }

      curAlert.timer = this.scheduleClose(alert.id, alert.duration);
      curAlert.updated = Date.now();
    } else {
      extendObservable(this.alerts, {
        [alert.id]: {
          ...alert,
          timer: this.scheduleClose(alert.id, alert.duration),
          updated: Date.now(),
        },
      });
    }
  }

  scheduleClose(id: string, duration = DEFAULT_DURATION): number {
    return window.setTimeout(() => {
      delete this.alerts[id];
    }, duration);
  }
}

export default new AlertStore();
