import axios from 'axios';

import type {ConnectionSettingsForm} from '@shared/types/Auth';
import type {TransferDirection} from '@shared/types/TransferData';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ConfigStore from '../stores/ConfigStore';

import type {ClientSettingsSaveSuccessAction} from '../constants/ServerActions';
import type {SettingUpdatesClient} from '../stores/SettingsStore';

const baseURI = ConfigStore.getBaseURI();

const ClientActions = {
  fetchSettings: (property?: Record<string, unknown>) =>
    axios
      .get(`${baseURI}api/client/settings`, {params: {property}})
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_SETTINGS_FETCH_REQUEST_SUCCESS',
            data,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_SETTINGS_FETCH_REQUEST_ERROR',
            error,
          });
        },
      ),

  saveSettings: (settings: SettingUpdatesClient, options: ClientSettingsSaveSuccessAction['options']) =>
    axios
      .patch(`${baseURI}api/client/settings`, settings)
      .then((json) => json.data)
      .then(
        (data) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_SETTINGS_SAVE_SUCCESS',
            data,
            options,
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_SETTINGS_SAVE_ERROR',
            error,
            options,
          });
        },
      ),

  setThrottle: (direction: TransferDirection, throttle: number) =>
    axios
      .put(`${baseURI}api/client/settings/speed-limits`, {
        direction,
        throttle,
      })
      .then((json) => json.data)
      .then(
        (transferData) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_SET_THROTTLE_SUCCESS',
            data: {
              transferData,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_SET_THROTTLE_ERROR',
            data: {
              error,
            },
          });
        },
      ),

  testClientConnectionSettings: (connectionSettings: ConnectionSettingsForm) => {
    const requestPayload = {
      host: connectionSettings.rtorrentHost,
      port: connectionSettings.rtorrentPort,
      socketPath: connectionSettings.rtorrentSocketPath,
    };

    return axios.post(`${baseURI}api/client/connection-test`, requestPayload).then((json) => json.data);
  },

  testConnection: () =>
    axios
      .get(`${baseURI}api/client/connection-test`)
      .then((json) => json.data)
      .then(
        () => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_CONNECTION_TEST_SUCCESS',
          });
        },
        () => {
          AppDispatcher.dispatchServerAction({
            type: 'CLIENT_CONNECTION_TEST_ERROR',
          });
        },
      ),
};

export default ClientActions;
