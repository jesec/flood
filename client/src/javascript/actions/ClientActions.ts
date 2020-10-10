import axios from 'axios';

import type {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';
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

  testClientConnectionSettings: (connectionSettings: ClientConnectionSettings) =>
    axios.post(`${baseURI}api/client/connection-test`, connectionSettings).then((json) => json.data),

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
