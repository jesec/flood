import axios, {AxiosError} from 'axios';

import AuthStore from '@client/stores/AuthStore';
import ConfigStore from '@client/stores/ConfigStore';

import type {
  AuthAuthenticationOptions,
  AuthAuthenticationResponse,
  AuthRegistrationOptions,
  AuthRegistrationResponse,
  AuthUpdateUserOptions,
  AuthVerificationResponse,
} from '@shared/schema/api/auth';
import type {Credentials} from '@shared/schema/Auth';

import ClientActions from './ClientActions';
import FloodActions from './FloodActions';
import SettingActions from './SettingActions';

const {baseURI} = ConfigStore;

const AuthActions = {
  authenticate: (options: AuthAuthenticationOptions) =>
    axios
      .post<AuthAuthenticationResponse>(`${baseURI}api/auth/authenticate`, options)
      .then(
        ({data}) => {
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
    axios.post<AuthRegistrationResponse>(`${baseURI}api/auth/register?cookie=false`, options).then(({data}) => {
      AuthStore.handleCreateUserSuccess(data);
    }),

  updateUser: (username: Credentials['username'], options: AuthUpdateUserOptions) =>
    axios.patch(`${baseURI}api/auth/users/${encodeURIComponent(username)}`, options).then((res) => res.data),

  deleteUser: (username: Credentials['username']) =>
    axios.delete(`${baseURI}api/auth/users/${encodeURIComponent(username)}`).then(
      () => {
        // do nothing.
      },
      () => {
        // do nothing.
      },
    ),

  fetchUsers: () =>
    axios.get<Array<Credentials>>(`${baseURI}api/auth/users`).then(({data}) => {
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
    axios.post<AuthRegistrationResponse>(`${baseURI}api/auth/register`, options).then(
      ({data}) => {
        AuthStore.handleRegisterSuccess(data);
      },
      (error: AxiosError) => {
        throw error;
      },
    ),

  verify: () =>
    axios
      .get<AuthVerificationResponse>(`${baseURI}api/auth/verify?${Date.now()}`)
      .then(
        ({data}) => {
          if (data.configs != null) {
            ConfigStore.handlePreloadConfigs(data.configs);
          }
          return data;
        },
        (error: AxiosError<AuthVerificationResponse>) => {
          if (error.response?.data?.configs != null) {
            ConfigStore.handlePreloadConfigs(error.response.data.configs);
          }
          throw error;
        },
      )
      .then((data) => {
        AuthStore.handleAuthVerificationSuccess(data);

        return Promise.all([ClientActions.fetchSettings(), SettingActions.fetchSettings()]).then(() => data);
      })
      .catch((error) => {
        AuthStore.handleAuthVerificationError();

        throw error;
      }),
} as const;

export default AuthActions;
