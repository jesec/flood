import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import FloodActions from '../actions/FloodActions';

export interface Notification {
  _id: string;
  id: 'notification.torrent.finished' | 'notification.torrent.errored' | 'notification.feed.downloaded.torrent';
  read: boolean;
  ts: number; // timestamp
  data: {
    name: string;
    ruleLabel?: string;
    feedLabel?: string;
    title?: string;
  };
}

export interface NotificationCount {
  total: number;
  unread: number;
  read: number;
}

export interface NotificationState {
  id: string;
  count: NotificationCount;
  limit: number;
  start: number;
  notifications: Array<Notification>;
}

interface NotificationClearOptions {
  id: string;
  limit: number;
}

const INITIAL_COUNT_STATE: NotificationCount = {total: 0, unread: 0, read: 0};

class NotificationStoreClass extends BaseStore {
  notifications: Record<string, NotificationState> = {};
  notificationCount: NotificationCount = INITIAL_COUNT_STATE;
  ongoingPolls = {};

  clearAll(options: NotificationClearOptions) {
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

  handleNotificationsClearSuccess(options: NotificationClearOptions) {
    FloodActions.fetchNotifications({
      ...options,
      start: 0,
    });
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
      NotificationStore.handleNotificationsClearSuccess(action.data as NotificationClearOptions);
      break;
    case 'FLOOD_FETCH_NOTIFICATIONS_ERROR':
      NotificationStore.handleNotificationsFetchError();
      break;
    case 'FLOOD_FETCH_NOTIFICATIONS_SUCCESS':
      NotificationStore.handleNotificationsFetchSuccess(action.data as NotificationState);
      break;
    case 'NOTIFICATION_COUNT_CHANGE':
      NotificationStore.handleNotificationCountChange(action.data as NotificationCount);
      break;
    default:
      break;
  }
});

export default NotificationStore;
