import {computed, makeAutoObservable} from 'mobx';

import type {Notification, NotificationCount, NotificationState} from '@shared/types/Notification';

const INITIAL_COUNT_STATE: NotificationCount = {total: 0, unread: 0, read: 0};

class NotificationStore {
  notifications: Array<Notification> = [];
  notificationCount: NotificationCount = INITIAL_COUNT_STATE;

  @computed get hasNotification() {
    return this.notificationCount.total !== 0;
  }

  constructor() {
    makeAutoObservable(this);
  }

  clearAll() {
    this.notifications = [];
    this.notificationCount = INITIAL_COUNT_STATE;
  }

  handleNotificationCountChange(notificationCount: NotificationCount) {
    this.notificationCount = notificationCount == null ? INITIAL_COUNT_STATE : notificationCount;
  }

  handleNotificationsFetchSuccess(data: NotificationState) {
    this.notifications = data.notifications;
  }
}

export default new NotificationStore();
