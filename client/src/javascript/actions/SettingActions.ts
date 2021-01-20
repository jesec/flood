import axios from 'axios';

import AlertStore from '@client/stores/AlertStore';
import ConfigStore from '@client/stores/ConfigStore';
import SettingStore from '@client/stores/SettingStore';

import type {FloodSetting, FloodSettings} from '@shared/types/FloodSettings';
import type {SetFloodSettingsOptions} from '@shared/types/api/index';

const {baseURI} = ConfigStore;

const SettingActions = {
  fetchSettings: async (): Promise<void> =>
    axios
      .get(`${baseURI}api/settings`)
      .then((json) => json.data)
      .then(
        (data) => {
          SettingStore.handleSettingsFetchSuccess(data);
        },
        () => {
          // do nothing.
        },
      ),

  saveSettings: async (settings: SetFloodSettingsOptions, options?: {alert?: boolean}): Promise<void> => {
    if (Object.keys(settings).length > 0) {
      SettingStore.saveFloodSettings(settings);

      let err = false;
      await axios
        .patch(`${baseURI}api/settings`, settings)
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

  saveSetting: async <T extends FloodSetting>(property: T, data: FloodSettings[T]): Promise<void> =>
    SettingActions.saveSettings({[property]: data}),
} as const;

export default SettingActions;
