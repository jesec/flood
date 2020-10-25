import type {FloodSettings} from '@shared/types/FloodSettings';

import SettingActions from '../actions/SettingActions';

export const saveAddTorrentsUserPreferences = ({start, destination}: {start?: boolean; destination?: string}) => {
  const changedSettings: Partial<FloodSettings> = {};

  if (start != null) {
    changedSettings.startTorrentsOnLoad = start;
  }

  if (destination != null) {
    changedSettings.torrentDestination = destination;
  }

  SettingActions.saveSettings(changedSettings);
};

export const saveDeleteTorrentsUserPreferences = ({deleteData}: {deleteData?: boolean}) => {
  SettingActions.saveSetting('deleteTorrentData', deleteData);
};
