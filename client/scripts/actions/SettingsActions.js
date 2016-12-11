import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';

let SettingsActions = {
  addFeed: (feed) => {
    return axios.put('/api/feed-monitor/feeds', feed)
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FEED_MONITOR_FEED_ADD_SUCCESS,
          data
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FEED_MONITOR_FEED_ADD_ERROR,
          error
        });
      });
  },

  addRule: (rule) => {
    return axios.put('/api/feed-monitor/rules', rule)
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FEED_MONITOR_RULE_ADD_SUCCESS,
          data
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FEED_MONITOR_RULE_ADD_ERROR,
          error
        });
      });
  },

  fetchFeedMonitors: (query) => {
    return axios.get('/api/feed-monitor', query)
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FEED_MONITORS_FETCH_SUCCESS,
          data
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FEED_MONITORS_FETCH_ERROR,
          error
        });
      });
  },

  fetchFeeds: (query) => {
    return axios.get('/api/feed-monitor/feeds', query)
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FEED_MONITOR_FEEDS_FETCH_SUCCESS,
          data
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FEED_MONITOR_FEEDS_FETCH_ERROR,
          error
        });
      });
  },

  fetchRules: (query) => {
    return axios.get('/api/feed-monitor/rules', query)
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FEED_MONITOR_RULES_FETCH_SUCCESS,
          data
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FEED_MONITOR_RULES_FETCH_ERROR,
          error
        });
      });
  },

  fetchSettings: (property) => {
    return axios.get('/api/settings', {params: {property}})
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FETCH_REQUEST_SUCCESS,
          data
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FETCH_REQUEST_ERROR,
          error
        });
      });
  },

  removeFeedMonitor: (id) => {
    return axios.delete(`/api/feed-monitor/${id}`)
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FEED_MONITOR_REMOVE_SUCCESS,
          data: {
            ...data,
            id
          }
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FEED_MONITOR_REMOVE_ERROR,
          error: {
            ...error,
            id
          }
        });
      });
  },

  saveSettings: (settings, options = {}) => {
    return axios.patch('/api/settings', settings)
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_SAVE_REQUEST_SUCCESS,
          data,
          options
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_SAVE_REQUEST_ERROR,
          error
        });
      });
  }
};

export default SettingsActions;
