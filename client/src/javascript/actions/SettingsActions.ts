import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ConfigStore from '../stores/ConfigStore';

import type {Feed, Rule} from '../stores/FeedsStore';
import type {SettingsSaveRequestSuccessAction} from '../constants/ServerActions';
import type {SettingUpdatesFlood} from '../stores/SettingsStore';

const baseURI = ConfigStore.getBaseURI();

const SettingsActions = {
  addFeed: (feed: Feed) =>
    axios
      .put(`${baseURI}api/feed-monitor/feeds`, feed)
      .then((json) => json.data)
      .then(
        () => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITOR_FEED_ADD_SUCCESS',
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITOR_FEED_ADD_ERROR',
            error,
          });
        },
      ),

  modifyFeed: (id: Feed['_id'], feed: Feed) =>
    axios
      .put(`${baseURI}api/feed-monitor/feeds/${id}`, feed)
      .then((json) => json.data)
      .then(
        () => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITOR_FEED_MODIFY_SUCCESS',
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITOR_FEED_MODIFY_ERROR',
            error,
          });
        },
      ),

  addRule: (rule: Rule) =>
    axios
      .put(`${baseURI}api/feed-monitor/rules`, rule)
      .then((json) => json.data)
      .then(
        () => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITOR_RULE_ADD_SUCCESS',
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITOR_RULE_ADD_ERROR',
            error,
          });
        },
      ),

  fetchFeedMonitors: () =>
    axios
      .get(`${baseURI}api/feed-monitor`)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITORS_FETCH_SUCCESS',
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITORS_FETCH_ERROR',
            error,
          });
        },
      ),

  fetchFeeds: (query: string) =>
    axios
      .get(`${baseURI}api/feed-monitor/feeds`, {params: query})
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITOR_FEEDS_FETCH_SUCCESS',
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITOR_FEEDS_FETCH_ERROR',
            error,
          });
        },
      ),

  fetchItems: (query: {params: {id: string; search: string}}) =>
    axios
      .get(`${baseURI}api/feed-monitor/items`, query)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITOR_ITEMS_FETCH_SUCCESS',
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITOR_ITEMS_FETCH_ERROR',
            error,
          });
        },
      ),

  fetchRules: (query: string) =>
    axios
      .get(`${baseURI}api/feed-monitor/rules`, {params: query})
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITOR_RULES_FETCH_SUCCESS',
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITOR_RULES_FETCH_ERROR',
            error,
          });
        },
      ),

  fetchSettings: (property?: Record<string, unknown>) =>
    axios
      .get(`${baseURI}api/settings`, {params: {property}})
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FETCH_REQUEST_SUCCESS',
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FETCH_REQUEST_ERROR',
            error,
          });
        },
      ),

  removeFeedMonitor: (id: string) =>
    axios
      .delete(`${baseURI}api/feed-monitor/${id}`)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITOR_REMOVE_SUCCESS',
            data: {
              ...data,
              id,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_FEED_MONITOR_REMOVE_ERROR',
            error: {
              ...error,
              id,
            },
          });
        },
      ),

  saveSettings: (settings: SettingUpdatesFlood, options: SettingsSaveRequestSuccessAction['options']) =>
    axios
      .patch(`${baseURI}api/settings`, settings)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_SAVE_REQUEST_SUCCESS',
            data,
            options,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'SETTINGS_SAVE_REQUEST_ERROR',
            error,
          });
        },
      ),
};

export default SettingsActions;
