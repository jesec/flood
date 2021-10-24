import axios from 'axios';

import AlertStore from '@client/stores/AlertStore';
import ConfigStore from '@client/stores/ConfigStore';
import SettingStore from '@client/stores/SettingStore';

import type {FloodSetting, FloodSettings} from '@shared/types/FloodSettings';
import type {SetFloodSettingsOptions} from '@shared/types/api/index';

const {baseURI} = ConfigStore;

const SettingActions = {
  fetchSettings: async (): Promise<void> =>
    axios.get<FloodSettings>(`${baseURI}api/settings`).then(
      ({data}) => {
        SettingStore.handleSettingsFetchSuccess(data);
      },
      () => {
        // do nothing.
      },
    ),

  saveSettings: async (settings: SetFloodSettingsOptions, options?: {alert?: boolean}): Promise<void> => {
    if (Object.keys(settings).length > 0) {
      SettingStore.saveFloodSettings(settings);

      const success = await axios.patch(`${baseURI}api/settings`, settings).then(
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

  saveSetting: async <T extends FloodSetting>(property: T, data: FloodSettings[T]): Promise<void> =>
    SettingActions.saveSettings({[property]: data}),
} as const;

export default SettingActions;
