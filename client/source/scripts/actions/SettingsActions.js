import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';

const SettingsActions = {
  fetchSettings: (property) => {
    return axios.get('/client/settings', {params: {property}})
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
        console.trace(error);
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_FETCH_REQUEST_ERROR,
          error
        });
      });
  },

  saveSettings: (settings) => {
    return axios.patch('/client/settings', settings)
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_SAVE_REQUEST_SUCCESS,
          data
        });
      })
      .catch((error) => {
        console.error(error);
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.SETTINGS_SAVE_REQUEST_ERROR,
          error
        });
      });
  }
};

export default SettingsActions;
