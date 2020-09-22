import type {NotificationCount, NotificationFetchOptions, NotificationState} from '@shared/types/Notification';

import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import FloodActions from '../actions/FloodActions';

const INITIAL_COUNT_STATE: NotificationCount = {total: 0, unread: 0, read: 0};

class NotificationStoreClass extends BaseStore {
  notifications: Record<string, NotificationState> = {};
  notificationCount: NotificationCount = INITIAL_COUNT_STATE;
  ongoingPolls = {};

  clearAll(options: NotificationFetchOptions) {
    this.notifications = {};
    FloodActions.clearNotifications(options);
  }

  getNotificationCount() {
    return this.notificationCount;
  }

  getNotifications(id: string): NotificationState {
    return {...INITIAL_COUNT_STATE, ...this.notifications[id]};
  }

  handleNotificationCountChange(notificationCount: NotificationCount) {
    this.notificationCount = notificationCount;
    this.emit('NOTIFICATIONS_COUNT_CHANGE', notificationCount);
  }

  handleNotificationsClearSuccess(options: NotificationFetchOptions) {
    FloodActions.fetchNotifications(options);
    this.emit('NOTIFICATIONS_CLEAR_SUCCESS');
  }

  handleNotificationsFetchError() {
    this.emit('NOTIFICATIONS_FETCH_ERROR');
  }

  handleNotificationsFetchSuccess(response: NotificationState) {
    this.notifications[response.id] = response;
    this.emit('NOTIFICATIONS_FETCH_SUCCESS');
  }
}

const NotificationStore = new NotificationStoreClass();

NotificationStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action} = payload;

  switch (action.type) {
    case 'FLOOD_CLEAR_NOTIFICATIONS_SUCCESS':
      NotificationStore.handleNotificationsClearSuccess(action.data);
      break;
    case 'FLOOD_FETCH_NOTIFICATIONS_ERROR':
      NotificationStore.handleNotificationsFetchError();
      break;
    case 'FLOOD_FETCH_NOTIFICATIONS_SUCCESS':
      NotificationStore.handleNotificationsFetchSuccess(action.data);
      break;
    case 'NOTIFICATION_COUNT_CHANGE':
      NotificationStore.handleNotificationCountChange(action.data);
      break;
    default:
      break;
  }
});

export default NotificationStore;
