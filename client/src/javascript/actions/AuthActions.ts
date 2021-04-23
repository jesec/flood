import axios, {AxiosError, AxiosResponse} from 'axios';

import AuthStore from '@client/stores/AuthStore';
import ConfigStore from '@client/stores/ConfigStore';

import type {
  AuthAuthenticationOptions,
  AuthRegistrationOptions,
  AuthUpdateUserOptions,
  AuthVerificationResponse,
} from '@shared/schema/api/auth';
import type {Credentials} from '@shared/schema/Auth';

import ClientActions from './ClientActions';
import FloodActions from './FloodActions';
import SettingActions from './SettingActions';

const {baseURI} = ConfigStore;
const httpBasicAuth = require('basic-auth')

const AuthActions = {
  httpbasicauth: () =>
    axios.get(`${baseURI}api/auth/httpbasicauth`)
      .then((json) => json.data)
      .then(
        (data) => {
          const parsed = httpBasicAuth.parse(data.authorization);
          if (parsed === undefined) {
            return { hasHTTPBasicAuth: false };
          }

          data.username = parsed.name;
          data.password = parsed.pass;

          return { hasHTTPBasicAuth: true };
        },
      (error: AxiosError) => {
        throw error;
      }),

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
      .then(() =>
        Promise.all([
          ClientActions.fetchSettings(),
          SettingActions.fetchSettings(),
          FloodActions.restartActivityStream(),
        ]),
      ),

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
      .then(
        (res: AxiosResponse) => {
          if (res.data.configs != null) {
            ConfigStore.handlePreloadConfigs(res.data.configs);
          }
          return res.data;
        },
        (error: AxiosError) => {
          if (error.response?.data?.configs != null) {
            ConfigStore.handlePreloadConfigs(error.response.data.configs);
          }
          throw error;
        },
      )
      .then(
        (data: AuthVerificationResponse) => {
          AuthStore.handleAuthVerificationSuccess(data);

          return Promise.all([ClientActions.fetchSettings(), SettingActions.fetchSettings()]).then(() => data);
        },
        (error) => {
          AuthStore.handleAuthVerificationError();

          throw error;
        },
      ),
} as const;

export default AuthActions;
