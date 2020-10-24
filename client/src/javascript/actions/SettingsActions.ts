import axios from 'axios';

import type {AddFeedOptions, AddRuleOptions, ModifyFeedOptions} from '@shared/types/api/feed-monitor';
import type {SetFloodSettingsOptions} from '@shared/types/api/index';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ConfigStore from '../stores/ConfigStore';

import type {SettingsSaveRequestSuccessAction} from '../constants/ServerActions';

const baseURI = ConfigStore.getBaseURI();

const SettingsActions = {
  addFeed: (options: AddFeedOptions) =>
    axios
      .put(`${baseURI}api/feed-monitor/feeds`, options)
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

  modifyFeed: (id: string, options: ModifyFeedOptions) =>
    axios
      .patch(`${baseURI}api/feed-monitor/feeds/${id}`, options)
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

  addRule: (options: AddRuleOptions) =>
    axios
      .put(`${baseURI}api/feed-monitor/rules`, options)
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

  fetchItems: ({id, search}: {id: string; search: string}) =>
    axios
      .get(`${baseURI}api/feed-monitor/feeds/${id}/items`, {
        params: {
          search,
        },
      })
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

  saveSettings: (settings: SetFloodSettingsOptions, options: SettingsSaveRequestSuccessAction['options']) =>
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
