import axios from 'axios';

import type {ClientSetting, ClientSettings} from '@shared/types/ClientSettings';
import type {SetClientSettingsOptions} from '@shared/types/api/client';

import ConfigStore from '../stores/ConfigStore';
import SettingStore from '../stores/SettingStore';
import AlertStore from '../stores/AlertStore';

const {baseURI} = ConfigStore;

const ClientActions = {
  fetchSettings: async (): Promise<void> =>
    axios
      .get(`${baseURI}api/client/settings`)
      .then((json) => json.data)
      .then(
        (data) => {
          SettingStore.handleClientSettingsFetchSuccess(data);
        },
        () => {
          // do nothing.
        },
      ),

  saveSettings: async (settings: SetClientSettingsOptions, options?: {alert?: boolean}): Promise<void> => {
    if (Object.keys(settings).length > 0) {
      SettingStore.saveClientSettings(settings);

      let err = false;
      await axios
        .patch(`${baseURI}api/client/settings`, settings)
        .then((json) => json.data)
        .then(
          () => {
            // do nothing.
          },
          () => {
            err = true;
          },
        );

      if (options?.alert) {
        // TODO: More precise error message.
        AlertStore.add(
          err
            ? {
                id: 'general.error.unknown',
              }
            : {
                id: 'alert.settings.saved',
              },
        );
      }
    }
  },

  saveSetting: async <T extends ClientSetting>(property: T, data: ClientSettings[T]): Promise<void> => {
    return ClientActions.saveSettings({[property]: data});
  },

  testConnection: async (): Promise<void> =>
    axios
      .get(`${baseURI}api/client/connection-test`)
      .then((json) => json.data)
      .then(() => {
        // do nothing.
      }),
} as const;

export default ClientActions;
