import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';
import NotificationStore from './NotificationStore';
import SettingsActions from '../actions/SettingsActions';
import UIStore from './UIStore';

class SettingsStoreClass extends BaseStore {
  constructor() {
    super();

    // Default settings are overridden by settings stored in database.
    this.settings = {
      sortTorrents: {
        direction: 'desc',
        displayName: 'Date Added',
        property: 'sortBy',
        value: 'added'
      },
      speedLimits: {
        download: [1024, 10240, 102400, 512000, 1048576, 2097152, 5242880, 10485760, 0],
        upload: [1024, 10240, 102400, 512000, 1048576, 2097152, 5242880, 10485760, 0]
      }
    };
  }

  fetchSettings(property) {
    SettingsActions.fetchSettings(property);
  }

  getSettings(property) {
    if (property) {
      return this.settings[property];
    }

    return this.settings;
  }

  handleSettingsFetchError(error) {
    this.emit(EventTypes.SETTINGS_FETCH_REQUEST_ERROR);
  }

  handleSettingsFetchSuccess(settings) {
    Object.keys(settings).forEach((property) => {
      this.settings[property] = settings[property];
    });

    this.emit(EventTypes.SETTINGS_CHANGE);
    this.emit(EventTypes.SETTINGS_FETCH_REQUEST_SUCCESS);
  }

  handleSettingsSaveRequestError() {
    this.emit(EventTypes.SETTINGS_SAVE_REQUEST_ERROR);
  }

  handleSettingsSaveRequestSuccess(data, options = {}) {
    this.emit(EventTypes.SETTINGS_SAVE_REQUEST_SUCCESS);

    if (options.notify) {
      NotificationStore.add({
        adverb: 'Successfully',
        action: 'saved',
        subject: 'settings',
        id: 'save-torrents-success'
      });
    }

    if (options.dismissModal) {
      UIStore.dismissModal();
    }
  }

  saveSettings(settings, options) {
    this.settings[settings.id] = settings.data;
    SettingsActions.saveSettings(settings, options);
    this.emit(EventTypes.SETTINGS_CHANGE);
  }
}

let SettingsStore = new SettingsStoreClass();

SettingsStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action, source} = payload;

  switch (action.type) {
    case ActionTypes.SETTINGS_FETCH_REQUEST_SUCCESS:
      SettingsStore.handleSettingsFetchSuccess(action.data);
      break;
    case ActionTypes.SETTINGS_FETCH_REQUEST_ERROR:
      SettingsStore.handleSettingsFetchError(action.error);
      break;
    case ActionTypes.SETTINGS_SAVE_REQUEST_ERROR:
      SettingsStore.handleSettingsSaveRequestError(action.error);
      break;
    case ActionTypes.SETTINGS_SAVE_REQUEST_SUCCESS:
      SettingsStore.handleSettingsSaveRequestSuccess(action.data, action.options);
      break;
  }
});

export default SettingsStore;
