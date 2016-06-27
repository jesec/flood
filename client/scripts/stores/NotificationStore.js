import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';

const DEFAULT_DURATION = 5 * 1000;

class NotificationStoreClass extends BaseStore {
  constructor() {
    super();

    this.notifications = {};
    this.accumulation = {};
  }

  accumulate(notification) {
    let {id, value} = notification.accumulation;

    if (this.accumulation[id] == null) {
      this.accumulation[id] = value;
    } else {
      this.accumulation[id] += value;
    }
  }

  add(notification) {
    notification.duration = this.getDuration(notification);
    notification.id = this.getID(notification);

    if (!!notification.accumulation) {
      this.accumulate(notification);
    }

    this.scheduleCleanse(notification);

    this.notifications[notification.id] = notification;

    this.emit(EventTypes.NOTIFICATIONS_CHANGE);
  }

  getDuration(notification) {
    return notification.duration || DEFAULT_DURATION;
  }

  getNotifications() {
    let notificationIDs = Object.keys(this.notifications).sort();

    return notificationIDs.map((id) => {
      let notification = this.notifications[id];

      if (!!notification.accumulation) {
        notification.count = this.accumulation[notification.accumulation.id];
      }

      return notification;
    });
  }

  getID(notification) {
    return notification.id || Date.now();
  }

  removeExpired(notification) {
    let {accumulation} = notification;

    if (!!accumulation) {
      this.removeAccumulation(notification);

      if (this.accumulation[accumulation.id] === 0) {
        delete this.accumulation[accumulation.id];
        delete this.notifications[notification.id];
      }
    } else {
      delete this.notifications[notification.id];
    }

    this.emit(EventTypes.NOTIFICATIONS_CHANGE);
  }

  removeAccumulation(notification) {
    let {id, value} = notification.accumulation;

    if (this.accumulation[id] == null) {
      return;
    }

    this.accumulation[id] -= value;
  }

  scheduleCleanse(notification) {
    setTimeout(this.removeExpired.bind(this, notification),
      notification.duration);
  }
}

let NotificationStore = new NotificationStoreClass();

NotificationStore.dispatcherID = AppDispatcher.register((payload) => {
  // const {action, source} = payload;

  // switch (action.type) {
  // }
});

export default NotificationStore;
