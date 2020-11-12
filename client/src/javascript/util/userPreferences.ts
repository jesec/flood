import type {FloodSettings} from '@shared/types/FloodSettings';

import SettingActions from '../actions/SettingActions';

export const saveAddTorrentsUserPreferences = ({start, destination}: {start?: boolean; destination?: string}) => {
  const changedSettings: Partial<FloodSettings> = {};

  if (start != null) {
    changedSettings.startTorrentsOnLoad = start;
  }

  if (destination != null && destination !== '') {
    changedSettings.torrentDestination = destination;
  }

  SettingActions.saveSettings(changedSettings);
};

export const saveDeleteTorrentsUserPreferences = ({deleteData}: {deleteData?: boolean}) => {
  if (deleteData != null) {
    SettingActions.saveSetting('deleteTorrentData', deleteData);
  }
};
