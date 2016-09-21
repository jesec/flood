import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import AuthStore from '../stores/AuthStore';

let FloodActions = {
  fetchNotifications: () => {
    return axios.get('/api/notifications')
      .then((json = {}) => {
        return json.data;
      })
      .then((notifications) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.FLOOD_FETCH_NOTIFICATIONS_SUCCESS,
          data: {
            notifications
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.FLOOD_FETCH_NOTIFICATIONS_ERROR,
          data: {
            error
          }
        });
      });
  },

  fetchTransferData: () => {
    return axios.get('/api/stats')
      .then((json = {}) => {
        return json.data;
      })
      .then((transferData) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TRANSFER_DATA_SUCCESS,
          data: {
            transferData
          }
        });
      })
      .catch((error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TRANSFER_DATA_ERROR,
          data: {
            error
          }
        });
      });
  },

  fetchTransferHistory: (opts) => {
    return axios.get('/api/history', {
      params: opts
    })
    .then((json = {}) => {
      return json.data;
    })
    .then((data) => {
      AppDispatcher.dispatchServerAction({
        type: ActionTypes.CLIENT_FETCH_TRANSFER_HISTORY_SUCCESS,
        data
      });
    })
    .catch((error) => {
      AppDispatcher.dispatchServerAction({
        type: ActionTypes.CLIENT_FETCH_TRANSFER_HISTORY_ERROR,
        error
      });
    });
  }
};

export default FloodActions;
