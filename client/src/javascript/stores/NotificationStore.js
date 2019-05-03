import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';
import FloodActions from '../actions/FloodActions';

class NotificationStoreClass extends BaseStore {
  constructor() {
    super();

    this.notifications = {};
    this.notificationCount = {};
    this.ongoingPolls = {};
  }

  fetchNotifications(options = {}) {
    FloodActions.fetchNotifications(options);
  }

  clearAll(options) {
    this.notifications = {};
    FloodActions.clearNotifications(options);
  }

  getNotifications(id) {
    return this.notifications[id];
  }

  handleNotificationCountChange(notificationCount) {
    this.notificationCount = notificationCount;
    this.emit(EventTypes.NOTIFICATIONS_COUNT_CHANGE, notificationCount);
  }

  handleNotificationsClearSuccess(options) {
    this.fetchNotifications({
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
