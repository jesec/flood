import {computed, extendObservable, makeAutoObservable, runInAction} from 'mobx';
import {sort} from 'fast-sort';

export interface Alert {
  id: string;
  type: 'success' | 'error';
  count: number;
  duration: number;
  timer: number;
  updated: number;
}

class AlertStore {
  alerts: Record<string, Alert> = {};

  @computed get sortedAlerts(): Array<Alert> {
    return sort(Object.values(this.alerts)).asc((alert) => alert.updated);
  }

  constructor() {
    makeAutoObservable(this);
  }

  add({
    id,
    type = 'success',
    count = 0,
    duration = 5 * 1000,
  }: {
    id: string;
    type?: Alert['type'];
    count?: number;
    duration?: number;
  }) {
    const curAlert = this.alerts[id];

    if (curAlert != null) {
      clearTimeout(curAlert.timer);

      curAlert.count += count;
      curAlert.timer = this.scheduleClose(id, duration);
      curAlert.updated = Date.now();
    } else {
      const newAlert: Alert = {
        id,
        type,
        count,
        duration,
        timer: this.scheduleClose(id, duration),
        updated: Date.now(),
      };
      extendObservable(this.alerts, {[id]: newAlert});
    }
  }

  scheduleClose(id: string, duration: number): number {
    return window.setTimeout(() => {
      runInAction(() => {
        delete this.alerts[id];
      });
    }, duration);
  }
}

export default new AlertStore();
