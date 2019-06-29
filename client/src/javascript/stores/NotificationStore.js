import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';
import FloodActions from '../actions/FloodActions';

const INTIAL_COUNT_SATE = {total: 0, unread: 0, read: 0};

class NotificationStoreClass extends BaseStore {
  constructor() {
    super();

    this.notifications = {};
    this.notificationCount = {};
    this.ongoingPolls = {};
  }

  clearAll(options) {
    this.notifications = {};
    FloodActions.clearNotifications(options);
  }

  getNotificationCount() {
    return this.notificationCount;
  }

  getNotifications(id) {
    const notificationState = this.notifications[id];

    return {
      count: INTIAL_COUNT_SATE,
      ...notificationState,
    };
  }

  handleNotificationCountChange(notificationCount) {
    this.notificationCount = notificationCount;
    this.emit(EventTypes.NOTIFICATIONS_COUNT_CHANGE, notificationCount);
  }

  handleNotificationsClearSuccess(options) {
    FloodActions.fetchNotifications({
      ...options,
      start: 0,
    });
  }

  handleNotificationsFetchError() {
    this.emit(EventTypes.NOTIFICATIONS_FETCH_ERROR);
  }

  handleNotificationsFetchSuccess(response) {
    this.notifications[response.id] = response;
    this.emit(EventTypes.NOTIFICATIONS_FETCH_SUCCESS);
  }
}

const NotificationStore = new NotificationStoreClass();

NotificationStore.dispatcherID = AppDispatcher.register(payload => {
  const {action} = payload;

  switch (action.type) {
    case ActionTypes.FLOOD_CLEAR_NOTIFICATIONS_SUCCESS:
      NotificationStore.handleNotificationsClearSuccess(action.data);
      break;
    case ActionTypes.FLOOD_FETCH_NOTIFICATIONS_ERROR:
      NotificationStore.handleNotificationsFetchError(action.error);
      break;
    case ActionTypes.FLOOD_FETCH_NOTIFICATIONS_SUCCESS:
      NotificationStore.handleNotificationsFetchSuccess(action.data);
      break;
    case ActionTypes.NOTIFICATION_COUNT_CHANGE:
      NotificationStore.handleNotificationCountChange(action.data);
      break;
    default:
      break;
  }
});

export default NotificationStore;
