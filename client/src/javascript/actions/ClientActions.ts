import axios from 'axios';

import ConfigStore from '@client/stores/ConfigStore';
import SettingStore from '@client/stores/SettingStore';
import AlertStore from '@client/stores/AlertStore';

import type {ClientSetting, ClientSettings} from '@shared/types/ClientSettings';
import type {SetClientSettingsOptions} from '@shared/types/api/client';

const {baseURI} = ConfigStore;

const ClientActions = {
  fetchSettings: async (): Promise<void> =>
    axios.get<ClientSettings>(`${baseURI}api/client/settings`).then(
      ({data}) => {
        SettingStore.handleClientSettingsFetchSuccess(data);
      },
      () => {
        // do nothing.
      },
    ),

  saveSettings: async (settings: SetClientSettingsOptions, options?: {alert?: boolean}): Promise<void> => {
    if (Object.keys(settings).length > 0) {
      SettingStore.saveClientSettings(settings);

      const success = await axios.patch(`${baseURI}api/client/settings`, settings).then(
        () => true,
        () => false,
      );

      if (options?.alert) {
        // TODO: More precise error message.
        AlertStore.add(
          success
            ? {
                id: 'alert.settings.saved',
                type: 'success',
              }
            : {
                id: 'general.error.unknown',
                type: 'error',
              },
        );
      }
    }
  },

  saveSetting: async <T extends ClientSetting>(property: T, data: ClientSettings[T]): Promise<void> =>
    ClientActions.saveSettings({[property]: data}),

  testConnection: async (): Promise<void> =>
    axios.get(`${baseURI}api/client/connection-test`).then(() => {
      // do nothing.
    }),
} as const;

export default ClientActions;
