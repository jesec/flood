import axios from 'axios';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import ConfigStore from '../stores/ConfigStore';

const baseURI = ConfigStore.getBaseURI();

let AuthActions = {
  authenticate: (credentials) => {
    return axios.post(`${baseURI}auth/authenticate`, credentials)
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
    return axios.put(`${baseURI}auth/users`, credentials)
      .then((json = {}) => json.data)
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
    return axios.delete(`${baseURI}auth/users/${encodeURIComponent(username)}`)
      .then((json = {}) => json.data)
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
    return axios.get(`${baseURI}auth/users`)
      .then((json = {}) => json.data)
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

  logout: () => {
    return axios.get(`${baseURI}auth/logout`)
      .then(() => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.AUTH_LOGOUT_SUCCESS
        });
      }, (error) => {
        AppDispatcher.dispatchServerAction({
          type: ActionTypes.AUTH_LOGOUT_ERROR,
          error
        });
      });
  },

  register: (credentials) => {
    return axios.post(`${baseURI}auth/register`, credentials)
      .then((json = {}) => json.data)
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
    return axios.get(`${baseURI}auth/verify?${Date.now()}`)
      .then((json = {}) => json.data)
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
