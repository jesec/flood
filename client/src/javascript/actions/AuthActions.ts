import axios, {AxiosError} from 'axios';

import type {
  AuthAuthenticationOptions,
  AuthRegistrationOptions,
  AuthUpdateUserOptions,
  AuthVerificationResponse,
} from '@shared/schema/api/auth';
import type {Credentials} from '@shared/schema/Auth';

import AuthStore from '../stores/AuthStore';
import ClientActions from './ClientActions';
import ConfigStore from '../stores/ConfigStore';
import FloodActions from './FloodActions';
import SettingActions from './SettingActions';

const baseURI = ConfigStore.getBaseURI();

const AuthActions = {
  authenticate: (options: AuthAuthenticationOptions) =>
    axios
      .post(`${baseURI}api/auth/authenticate`, options)
      .then((json) => json.data)
      .then(
        (data) => {
          AuthStore.handleLoginSuccess(data);
        },
        (error) => {
          // TODO: Handle errors consistently in API, then create a client-side class to get meaningful messages from
          // server's response.
          let errorMessage;

          if (error.response && error.response.data.message != null) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          } else {
            errorMessage = 'An unknown error occurred.';
          }

          AuthStore.handleLoginError();

          throw new Error(errorMessage);
        },
      )
      .then(() => {
        return Promise.all([
          ClientActions.fetchSettings(),
          SettingActions.fetchSettings(),
          FloodActions.restartActivityStream(),
        ]);
      }),

  createUser: (options: AuthRegistrationOptions) =>
    axios
      .post(`${baseURI}api/auth/register?cookie=false`, options)
      .then((json) => json.data)
      .then((data) => {
        AuthStore.handleCreateUserSuccess(data);
      }),

  updateUser: (username: Credentials['username'], options: AuthUpdateUserOptions) =>
    axios.patch(`${baseURI}api/auth/users/${encodeURIComponent(username)}`, options).then((json) => json.data),

  deleteUser: (username: Credentials['username']) =>
    axios
      .delete(`${baseURI}api/auth/users/${encodeURIComponent(username)}`)
      .then((json) => json.data)
      .then(
        () => {
          // do nothing.
        },
        () => {
          // do nothing.
        },
      ),

  fetchUsers: () =>
    axios
      .get(`${baseURI}api/auth/users`)
      .then((json) => json.data)
      .then((data) => {
        AuthStore.handleListUsersSuccess(data);
      }),

  logout: () =>
    axios.get(`${baseURI}api/auth/logout`).then(
      () => {
        // do nothing.
      },
      () => {
        // do nothing.
      },
    ),

  register: (options: AuthRegistrationOptions) =>
    axios
      .post(`${baseURI}api/auth/register`, options)
      .then((json) => json.data)
      .then(
        (data) => {
          AuthStore.handleRegisterSuccess(data);
        },
        (error: AxiosError) => {
          throw error;
        },
      ),

  verify: () =>
    axios
      .get(`${baseURI}api/auth/verify?${Date.now()}`)
      .then((json) => json.data)
      .then(
        (data: AuthVerificationResponse) => {
          AuthStore.handleAuthVerificationSuccess(data);

          return Promise.all([ClientActions.fetchSettings(), SettingActions.fetchSettings()]).then(() => {
            return data;
          });
        },
        (error) => {
          AuthStore.handleAuthVerificationError();

          throw error;
        },
      ),
} as const;

export default AuthActions;
