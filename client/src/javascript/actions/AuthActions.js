import axios from 'axios';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import ConfigStore from '../stores/ConfigStore';

const basePath = ConfigStore.getBaseURI();

let AuthActions = {
  authenticate: (credentials) => {
    return axios.post(`${basePath}auth/authenticate`, credentials)
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.AUTH_LOGIN_SUCCESS,
          data
        });
      }, (error) => {
        let errorMessage;

        if (error.response) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else {
          errorMessage = 'An unknown error occurred.';
        }

        AppDispatcher.dispatchServerAction({
          type: ActionTypes.AUTH_LOGIN_ERROR,
          error: errorMessage
        });
      });
  },

  createUser: (credentials) => {
    return axios.put(`${basePath}auth/users`, credentials)
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.AUTH_CREATE_USER_SUCCESS,
          data
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.AUTH_CREATE_USER_ERROR,
          error
        });
      });
  },

  deleteUser: (username) => {
    return axios.delete(`${basePath}auth/users/${username}`)
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.AUTH_DELETE_USER_SUCCESS,
          data: {
            username,
            ...data
          }
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.AUTH_DELETE_USER_ERROR,
          error: {
            username,
            ...error
          }
        });
      });
  },

  fetchUsers: () => {
    return axios.get(`${basePath}auth/users`)
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.AUTH_LIST_USERS_SUCCESS,
          data
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.AUTH_LIST_USERS_ERROR,
          error
        });
      });
  },

  register: (credentials) => {
    return axios.post(`${basePath}auth/register`, credentials)
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.AUTH_REGISTER_SUCCESS,
          data
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.AUTH_REGISTER_ERROR,
          error
        });
      });
  },

  verify: () => {
    // We need to prevent caching this endpoint.
    return axios.get(`${basePath}auth/verify?${Date.now()}`)
      .then((json = {}) => {
        return json.data;
      })
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.AUTH_VERIFY_SUCCESS,
          data
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.AUTH_VERIFY_ERROR,
          error
        });
      });
  }
};

export default AuthActions;
