import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import AuthStore from '../stores/AuthStore';
import ConfigStore from '../stores/ConfigStore';

const baseURI = ConfigStore.getBaseURI();

let FloodActions = {
  clearNotifications: (options) => {
    return axios.delete(`${baseURI}api/notifications`)
      .then((json = {}) => {
        return json.data;
      })
      .then((response = {}) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.FLOOD_CLEAR_NOTIFICATIONS_SUCCESS,
          data: {
            ...response,
            ...options
          }
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.FLOOD_CLEAR_NOTIFICATIONS_ERROR,
          data: {
            error
          }
        });
      });
  },

  fetchDirectoryList: (options = {}) => {
    return axios.get(`${baseURI}api/directory-list`, {
        params: options
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((response) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.FLOOD_FETCH_DIRECTORY_LIST_SUCCESS,
          data: {
            ...options,
            ...response
          }
        });
      }, (error = {}) => {
        const {response: errorData} = error;

        AppDispatcher.dispatchServerAction({
          type: ActionTypes.FLOOD_FETCH_DIRECTORY_LIST_ERROR,
          error: errorData
        });
      });
  },

  fetchMediainfo: (options) => {
    return axios.get(`${baseURI}api/mediainfo`, {
        params: {
          hash: options.hash
        }
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((response) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.FLOOD_FETCH_MEDIAINFO_SUCCESS,
          data: {
            ...response,
            ...options
          }
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.FLOOD_FETCH_MEDIAINFO_ERROR,
          error
        });
      });
  },

  fetchNotifications: (options) => {
    return axios.get(`${baseURI}api/notifications`, {
        params: {
          limit: options.limit,
          start: options.start
        }
      })
      .then((json = {}) => {
        return json.data;
      })
      .then((response) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.FLOOD_FETCH_NOTIFICATIONS_SUCCESS,
          data: {
            ...response,
            ...options
          }
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.FLOOD_FETCH_NOTIFICATIONS_ERROR,
          data: {
            error
          }
        });
      });
  },

  fetchTransferData: () => {
    return axios.get(`${baseURI}api/stats`)
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
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.CLIENT_FETCH_TRANSFER_DATA_ERROR,
          data: {
            error
          }
        });
      });
  },

  fetchTransferHistory: (opts) => {
    return axios.get(`${baseURI}api/history`, {
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
    }, (error) => {
      AppDispatcher.dispatchServerAction({
        type: ActionTypes.CLIENT_FETCH_TRANSFER_HISTORY_ERROR,
        error
      });
    });
  }
};

export default FloodActions;
