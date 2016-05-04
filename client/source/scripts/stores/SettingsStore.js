import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';
import SettingsActions from '../actions/SettingsActions';

class SettingsStoreClass extends BaseStore {
  constructor() {
    super();
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

  handleSettingsFetchSuccess(settings) {
    this.settings = settings;
    this.emit(EventTypes.SETTINGS_FETCH_REQUEST_SUCCESS);
  }

  handleSettingsFetchError(error) {
    this.emit(EventTypes.SETTINGS_FETCH_REQUEST_ERROR);
  }

  saveSettings(settings) {
    this.settings[settings.id] = settings.data;
    SettingsActions.saveSettings(settings);
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
  }
});

export default SettingsStore;
