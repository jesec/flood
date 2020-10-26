import axios from 'axios';

import type {FloodSetting, FloodSettings} from '@shared/types/FloodSettings';
import type {SetFloodSettingsOptions} from '@shared/types/api/index';

import AlertStore from '../stores/AlertStore';
import ConfigStore from '../stores/ConfigStore';
import SettingStore from '../stores/SettingStore';

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
              }
            : {
                id: 'alert.settings.saved',
              },
        );
      }
    }
  },

  saveSetting: async <T extends FloodSetting>(property: T, data: FloodSettings[T]): Promise<void> => {
    return SettingActions.saveSettings({[property]: data});
  },
} as const;

export default SettingActions;
