import axios from 'axios';

import ConfigStore from '@client/stores/ConfigStore';
import SettingStore from '@client/stores/SettingStore';
import AlertStore from '@client/stores/AlertStore';

import type {ClientSetting, ClientSettings} from '@shared/types/ClientSettings';
import type {SetClientSettingsOptions} from '@shared/types/api/client';

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
                type: 'error',
              }
            : {
                id: 'alert.settings.saved',
                type: 'success',
              },
        );
      }
    }
  },

  saveSetting: async <T extends ClientSetting>(property: T, data: ClientSettings[T]): Promise<void> =>
    ClientActions.saveSettings({[property]: data}),

  testConnection: async (): Promise<void> =>
    axios
      .get(`${baseURI}api/client/connection-test`)
      .then((json) => json.data)
      .then(() => {
        // do nothing.
      }),
} as const;

export default ClientActions;
