import {makeAutoObservable} from 'mobx';

import type {Notification, NotificationCount, NotificationState} from '@shared/types/Notification';

const INITIAL_COUNT_STATE: NotificationCount = {total: 0, unread: 0, read: 0};

class NotificationStoreClass {
  notifications: Array<Notification> = [];
  notificationCount: NotificationCount = INITIAL_COUNT_STATE;
  ongoingPolls = {};

  constructor() {
    makeAutoObservable(this);
  }

  clearAll() {
    this.notifications = [];
  }

  handleNotificationCountChange(notificationCount: NotificationCount) {
    this.notificationCount = notificationCount;
  }

  handleNotificationsFetchSuccess(data: NotificationState) {
    this.notifications = data.notifications;
  }
}

const NotificationStore = new NotificationStoreClass();

export default NotificationStore;
