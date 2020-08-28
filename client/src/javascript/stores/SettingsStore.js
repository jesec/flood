import ActionTypes from '../constants/ActionTypes';
import AlertStore from './AlertStore';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import ClientActions from '../actions/ClientActions';
import EventTypes from '../constants/EventTypes';
import SettingsActions from '../actions/SettingsActions';
import UIStore from './UIStore';

class SettingsStoreClass extends BaseStore {
  constructor() {
    super();

    this.fetchStatus = {
      clientSettingsFetched: false,
      floodSettingsFetched: false,
    };

    this.clientSettings = {};

    // Default settings are overridden by settings stored in database.
    this.floodSettings = {
      language: 'auto',
      sortTorrents: {
        direction: 'desc',
        property: 'dateAdded',
      },
      torrentDetails: [
        {id: 'name', visible: true},
        {id: 'percentComplete', visible: true},
        {id: 'downTotal', visible: true},
        {id: 'downRate', visible: true},
        {id: 'upTotal', visible: true},
        {id: 'upRate', visible: true},
        {id: 'eta', visible: true},
        {id: 'ratio', visible: true},
        {id: 'sizeBytes', visible: true},
        {id: 'peers', visible: true},
        {id: 'seeds', visible: true},
        {id: 'dateAdded', visible: true},
        {id: 'dateCreated', visible: false},
        {id: 'basePath', visible: false},
        {id: 'comment', visible: false},
        {id: 'hash', visible: false},
        {id: 'isPrivate', visible: false},
        {id: 'message', visible: false},
        {id: 'trackerURIs', visible: false},
        {id: 'tags', visible: true},
      ],
      torrentListColumnWidths: {},
      torrentContextMenuItems: [
        {id: 'start', visible: true},
        {id: 'stop', visible: true},
        {id: 'remove', visible: true},
        {id: 'check-hash', visible: true},
        {id: 'set-taxonomy', visible: true},
        {id: 'move', visible: true},
        {id: 'set-tracker', visible: false},
        {id: 'torrent-details', visible: true},
        {id: 'torrent-download-tar', visible: true},
        {id: 'set-priority', visible: false},
      ],
      torrentListViewSize: 'condensed',
      speedLimits: {
        download: [1024, 10240, 102400, 512000, 1048576, 2097152, 5242880, 10485760, 0],
        upload: [1024, 10240, 102400, 512000, 1048576, 2097152, 5242880, 10485760, 0],
      },
      startTorrentsOnLoad: false,
      mountPoints: [],
    };
  }

  getClientSettings(property) {
    if (property) {
      return this.clientSettings[property];
    }

    return {...this.clientSettings};
  }

  getFloodSettings(property) {
    if (property) {
      return this.floodSettings[property];
    }

    return {...this.floodSettings};
  }

  handleClientSettingsFetchSuccess(settings) {
    this.fetchStatus.clientSettingsFetched = true;
    this.clientSettings = settings;

    this.processSettingsState();
  }

  handleClientSettingsFetchError() {
    this.emit(EventTypes.CLIENT_SETTINGS_FETCH_REQUEST_ERROR);
  }

  handleClientSettingsSaveRequestError() {
    this.emit(EventTypes.CLIENT_SETTINGS_SAVE_REQUEST_ERROR);
  }

  handleClientSettingsSaveRequestSuccess(data, options) {
    this.emit(EventTypes.CLIENT_SETTINGS_SAVE_REQUEST_SUCCESS);

    if (options.alert) {
      AlertStore.add({
        id: 'alert.settings.saved',
      });
    }

    if (options.dismissModal) {
      UIStore.dismissModal();
    }
  }

  handleSettingsFetchError() {
    this.emit(EventTypes.SETTINGS_FETCH_REQUEST_ERROR);
  }

  handleSettingsFetchSuccess(settings) {
    this.fetchStatus.floodSettingsFetched = true;

    Object.keys(settings).forEach((property) => {
      const incomingSettingsValue = settings[property];

      if (incomingSettingsValue != null) {
        this.floodSettings[property] = incomingSettingsValue;
      }
    });

    this.emit(EventTypes.SETTINGS_FETCH_REQUEST_SUCCESS);
    this.processSettingsState();
  }

  handleSettingsSaveRequestError() {
    this.emit(EventTypes.SETTINGS_SAVE_REQUEST_ERROR);
  }

  handleSettingsSaveRequestSuccess(data, options = {}) {
    this.emit(EventTypes.SETTINGS_SAVE_REQUEST_SUCCESS);

    if (options.alert) {
      AlertStore.add({
        id: 'alert.settings.saved',
      });
    }

    if (options.dismissModal) {
      UIStore.dismissModal();
    }
  }

  processSettingsState() {
    if (this.fetchStatus.clientSettingsFetched && this.fetchStatus.floodSettingsFetched) {
      this.emit(EventTypes.SETTINGS_CHANGE);
    }
  }

  saveFloodSettings(settings, options) {
    if (!Array.isArray(settings)) {
      settings = [settings];
    }

    SettingsActions.saveSettings(settings, options);
    this.updateLocalSettings(settings, 'floodSettings');
    this.emit(EventTypes.SETTINGS_CHANGE);
  }

  saveClientSettings(settings, options) {
    if (!Array.isArray(settings)) {
      settings = [settings];
    }

    ClientActions.saveSettings(settings, options);
    this.updateLocalSettings(settings, 'clientSettings');
    this.emit(EventTypes.SETTINGS_CHANGE);
  }

  updateOptimisticallyOnly(settings, settingsType = 'floodSettings') {
    if (!Array.isArray(settings)) {
      settings = [settings];
    }

    this.updateLocalSettings(settings, settingsType);
  }

  updateLocalSettings(settings, settingsType) {
    settings.forEach((setting) => {
      if (setting.overrideLocalSetting) {
        this[settingsType][setting.overrideID] = setting.overrideData;
      } else {
        this[settingsType][setting.id] = setting.data;
      }
    });
  }
}

const SettingsStore = new SettingsStoreClass();

SettingsStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action} = payload;

  switch (action.type) {
    case ActionTypes.CLIENT_SETTINGS_FETCH_REQUEST_ERROR:
      SettingsStore.handleClientSettingsFetchError(action.error);
      break;
    case ActionTypes.CLIENT_SETTINGS_FETCH_REQUEST_SUCCESS:
      SettingsStore.handleClientSettingsFetchSuccess(action.data);
      break;
    case ActionTypes.CLIENT_SET_THROTTLE_SUCCESS:
      ClientActions.fetchSettings();
      break;
    case ActionTypes.SETTINGS_FETCH_REQUEST_ERROR:
      SettingsStore.handleSettingsFetchError(action.error);
      break;
    case ActionTypes.SETTINGS_FETCH_REQUEST_SUCCESS:
      SettingsStore.handleSettingsFetchSuccess(action.data);
      break;
    case ActionTypes.SETTINGS_SAVE_REQUEST_ERROR:
      SettingsStore.handleSettingsSaveRequestError(action.error);
      break;
    case ActionTypes.SETTINGS_SAVE_REQUEST_SUCCESS:
      SettingsStore.handleSettingsSaveRequestSuccess(action.data, action.options);
      break;
    case ActionTypes.CLIENT_SETTINGS_SAVE_ERROR:
      SettingsStore.handleClientSettingsSaveRequestError(action.error);
      break;
    case ActionTypes.CLIENT_SETTINGS_SAVE_SUCCESS:
      SettingsStore.handleClientSettingsSaveRequestSuccess(action.data, action.options);
      break;
    default:
      break;
  }
});

export default SettingsStore;
