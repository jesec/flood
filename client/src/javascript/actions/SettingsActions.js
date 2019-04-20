import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import ConfigStore from '../stores/ConfigStore';

const baseURI = ConfigStore.getBaseURI();

let SettingsActions = {
  addFeed: feed => {
    return axios
      .put(`${baseURI}api/feed-monitor/feeds`, feed)
      .then((json = {}) => json.data)
      .then(
        data => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITOR_FEED_ADD_SUCCESS,
            data,
          });
        },
        error => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITOR_FEED_ADD_ERROR,
            error,
          });
        }
      );
  },

  modifyFeed: (id, feed) => {
    return axios
      .put(`${baseURI}api/feed-monitor/feeds/${id}`, feed)
      .then((json = {}) => json.data)
      .then(
        data => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITOR_FEED_MODIFY_SUCCESS,
            data,
          });
        },
        error => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITOR_FEED_MODiFY_ERROR,
            error,
          });
        }
      );
  },

  addRule: rule => {
    return axios
      .put(`${baseURI}api/feed-monitor/rules`, rule)
      .then((json = {}) => json.data)
      .then(
        data => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITOR_RULE_ADD_SUCCESS,
            data,
          });
        },
        error => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITOR_RULE_ADD_ERROR,
            error,
          });
        }
      );
  },

  fetchFeedMonitors: query => {
    return axios
      .get(`${baseURI}api/feed-monitor`, query)
      .then((json = {}) => json.data)
      .then(
        data => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITORS_FETCH_SUCCESS,
            data,
          });
        },
        error => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITORS_FETCH_ERROR,
            error,
          });
        }
      );
  },

  fetchFeeds: query => {
    return axios
      .get(`${baseURI}api/feed-monitor/feeds`, query)
      .then((json = {}) => json.data)
      .then(
        data => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITOR_FEEDS_FETCH_SUCCESS,
            data,
          });
        },
        error => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITOR_FEEDS_FETCH_ERROR,
            error,
          });
        }
      );
  },

  fetchItems: query => {
    return axios
      .get(`${baseURI}api/feed-monitor/items`, query)
      .then((json = {}) => json.data)
      .then(
        data => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITOR_ITEMS_FETCH_SUCCESS,
            data,
          });
        },
        error => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITOR_ITEMS_FETCH_ERROR,
            error,
          });
        }
      );
  },

  fetchRules: query => {
    return axios
      .get(`${baseURI}api/feed-monitor/rules`, query)
      .then((json = {}) => json.data)
      .then(
        data => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITOR_RULES_FETCH_SUCCESS,
            data,
          });
        },
        error => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITOR_RULES_FETCH_ERROR,
            error,
          });
        }
      );
  },

  fetchSettings: property => {
    return axios
      .get(`${baseURI}api/settings`, {params: {property}})
      .then((json = {}) => json.data)
      .then(
        data => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FETCH_REQUEST_SUCCESS,
            data,
          });
        },
        error => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FETCH_REQUEST_ERROR,
            error,
          });
        }
      );
  },

  removeFeedMonitor: id => {
    return axios
      .delete(`${baseURI}api/feed-monitor/${id}`)
      .then((json = {}) => json.data)
      .then(
        data => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITOR_REMOVE_SUCCESS,
            data: {
              ...data,
              id,
            },
          });
        },
        error => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_FEED_MONITOR_REMOVE_ERROR,
            error: {
              ...error,
              id,
            },
          });
        }
      );
  },

  saveSettings: (settings, options = {}) => {
    return axios
      .patch(`${baseURI}api/settings`, settings)
      .then((json = {}) => json.data)
      .then(
        data => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_SAVE_REQUEST_SUCCESS,
            data,
            options,
          });
        },
        error => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.SETTINGS_SAVE_REQUEST_ERROR,
            error,
          });
        }
      );
  },
};

export default SettingsActions;
