import axios from 'axios';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ClientActions from './ClientActions';
import ConfigStore from '../stores/ConfigStore';
import FloodActions from './FloodActions';
import SettingsActions from './SettingsActions';

import type {ConnectionSettings, Credentials, UserConfig} from '../stores/AuthStore';

const baseURI = ConfigStore.getBaseURI();

const AuthActions = {
  authenticate: (credentials: Credentials) =>
    axios
      .post(`${baseURI}auth/authenticate`, credentials)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'AUTH_LOGIN_SUCCESS',
            data,
          });
        },
        (error) => {
          // TODO: Handle errors consistently in API, then create a client-side class to get meaningful messages from
          // server's response.
          let errorMessage;

          if (error.response) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          } else {
            errorMessage = 'An unknown error occurred.';
          }

          AppDispatcher.dispatchServerAction({
            type: 'AUTH_LOGIN_ERROR',
            error: errorMessage,
          });

          throw new Error(errorMessage);
        },
      )
      .then(() => {
        return Promise.all([
          ClientActions.fetchSettings(),
          SettingsActions.fetchSettings(),
          FloodActions.restartActivityStream(),
        ]);
      }),

  createUser: (config: UserConfig) =>
    axios
      .put(`${baseURI}auth/users`, config)
      .then((json) => json.data)
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: 'AUTH_CREATE_USER_SUCCESS',
          data,
        });
      }),

  updateUser: (username: Credentials['username'], connectionSettings: ConnectionSettings) => {
    const requestPayload: Partial<Credentials> = {};

    if (connectionSettings.connectionType === 'socket') {
      requestPayload.socketPath = connectionSettings.rtorrentSocketPath;
    } else {
      requestPayload.port = connectionSettings.rtorrentPort;
      requestPayload.host = connectionSettings.rtorrentHost;
    }

    return axios
      .patch(`${baseURI}auth/users/${encodeURIComponent(username)}`, requestPayload)
      .then((json) => json.data);
  },

  deleteUser: (username: Credentials['username']) =>
    axios
      .delete(`${baseURI}auth/users/${encodeURIComponent(username)}`)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'AUTH_DELETE_USER_SUCCESS',
            data: {
              username,
              ...data,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'AUTH_DELETE_USER_ERROR',
            error: {
              username,
              ...error,
            },
          });
        },
      ),

  fetchUsers: () =>
    axios
      .get(`${baseURI}auth/users`)
      .then((json) => json.data)
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: 'AUTH_LIST_USERS_SUCCESS',
          data,
        });
      }),

  logout: () =>
    axios.get(`${baseURI}auth/logout`).then(
      () => {
        AppDispatcher.dispatchServerAction({
          type: 'AUTH_LOGOUT_SUCCESS',
        });
      },
      (error) => {
        AppDispatcher.dispatchServerAction({
          type: 'AUTH_LOGOUT_ERROR',
          error,
        });
      },
    ),

  register: (config: UserConfig) =>
    axios
      .post(`${baseURI}auth/register`, config)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'AUTH_REGISTER_SUCCESS',
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'AUTH_REGISTER_ERROR',
            error: error.response.data.message,
          });
        },
      ),

  verify: () =>
    axios
      .get(`${baseURI}auth/verify?${Date.now()}`)
      .then((json) => json.data)
      .then(
        (data: {isAdmin: boolean; success: boolean; initialUser?: boolean; token?: string; username: string}) => {
          AppDispatcher.dispatchServerAction({
            type: 'AUTH_VERIFY_SUCCESS',
            data,
          });

          return Promise.all([ClientActions.fetchSettings(), SettingsActions.fetchSettings()]).then(() => {
            return data;
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'AUTH_VERIFY_ERROR',
            error,
          });

          throw error;
        },
      ),
};

export default AuthActions;
