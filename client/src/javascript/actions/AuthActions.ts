import axios from 'axios';

import type {
  AuthAuthenticationOptions,
  AuthRegistrationOptions,
  AuthUpdateUserOptions,
  AuthVerificationResponse,
} from '@shared/schema/api/auth';
import type {Credentials} from '@shared/schema/Auth';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ClientActions from './ClientActions';
import ConfigStore from '../stores/ConfigStore';
import FloodActions from './FloodActions';
import SettingsActions from './SettingsActions';

const baseURI = ConfigStore.getBaseURI();

const AuthActions = {
  authenticate: (options: AuthAuthenticationOptions) =>
    axios
      .post(`${baseURI}api/auth/authenticate`, options)
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

  createUser: (options: AuthRegistrationOptions) =>
    axios
      .post(`${baseURI}api/auth/register?cookie=false`, options)
      .then((json) => json.data)
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: 'AUTH_CREATE_USER_SUCCESS',
          data,
        });
      }),

  updateUser: (username: Credentials['username'], options: AuthUpdateUserOptions) =>
    axios.patch(`${baseURI}api/auth/users/${encodeURIComponent(username)}`, options).then((json) => json.data),

  deleteUser: (username: Credentials['username']) =>
    axios
      .delete(`${baseURI}api/auth/users/${encodeURIComponent(username)}`)
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
      .get(`${baseURI}api/auth/users`)
      .then((json) => json.data)
      .then((data) => {
        AppDispatcher.dispatchServerAction({
          type: 'AUTH_LIST_USERS_SUCCESS',
          data,
        });
      }),

  logout: () =>
    axios.get(`${baseURI}api/auth/logout`).then(
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

  register: (options: AuthRegistrationOptions) =>
    axios
      .post(`${baseURI}api/auth/register`, options)
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
      .get(`${baseURI}api/auth/verify?${Date.now()}`)
      .then((json) => json.data)
      .then(
        (data: AuthVerificationResponse) => {
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
