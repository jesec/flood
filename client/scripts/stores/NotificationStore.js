import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import config from '../../../config';
import EventTypes from '../constants/EventTypes';
import FloodActions from '../actions/FloodActions';

class NotificationStoreClass extends BaseStore {
  constructor() {
    super();

    this.notifications = {};
    this.ongoingPolls = {};
  }

  clearAll(options) {
    this.notifications = {};
    FloodActions.clearNotifications(options);
  }

  fetchNotifications(options = {}) {
    if (!this.isRequestPending('fetch-notifications') || options.forceUpdate) {
      this.beginRequest('fetch-notifications');
      FloodActions.fetchNotifications(options);
    }

    if (this.ongoingPolls[options.id] == null) {
      this.startPollingNotifications(options);
    } else {
      this.updateOngingNotificationsPoll(options);
    }
  }

  getNotifications(id) {
    return this.notifications[id];
  }

  handleNotificationsClearSuccess(options) {
    this.fetchNotifications({
      ...options,
      start: 0
    });
  }

  handleNotificationsFetchError(error) {
    this.resolveRequest('fetch-notifications');

    this.emit(EventTypes.NOTIFICATIONS_FETCH_ERROR);
  }

  handleNotificationsFetchSuccess(response) {
    this.resolveRequest('fetch-notifications');

    this.notifications[response.id] = response;

    this.emit(EventTypes.NOTIFICATIONS_FETCH_SUCCESS);
  }

  startPollingNotifications(options) {
    this.ongoingPolls[options.id] = {
      ...options,
      intervalID: setInterval(
        this.fetchNotifications.bind(this, options),
        config.pollInterval
      )
    };
  }

  stopPollingNotifications(options = {}) {
    if (this.ongoingPolls[options.id]) {
      clearInterval(this.ongoingPolls[options.id].intervalID);
      delete this.ongoingPolls[options.id];
    }
  }

  updateOngingNotificationsPoll(options = {}) {
    if (this.ongoingPolls[options.id]) {
      clearInterval(this.ongoingPolls[options.id].intervalID);
      this.startPollingNotifications(options);
    }
  }
}

let NotificationStore = new NotificationStoreClass();

NotificationStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action, source} = payload;

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
  }
});

export default NotificationStore;
