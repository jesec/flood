import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';

const SettingsActions = {
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
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FETCH_REQUEST_ERROR,
          error
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
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_SAVE_REQUEST_ERROR,
          error
        });
      });
  }
};

export default SettingsActions;
