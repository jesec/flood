import type {FloodSettings} from '@shared/types/FloodSettings';

import SettingsStore from '../stores/SettingsStore';

export const saveAddTorrentsUserPreferences = ({start, destination}: {start?: boolean; destination?: string}) => {
  const changedSettings: Partial<FloodSettings> = {};

  if (start != null) {
    changedSettings.startTorrentsOnLoad = start;
  }

  if (destination != null) {
    changedSettings.torrentDestination = destination;
  }

  SettingsStore.saveFloodSettings(changedSettings);
};

export const saveDeleteTorrentsUserPreferences = ({deleteData}: {deleteData?: boolean}) => {
  SettingsStore.setFloodSetting('deleteTorrentData', deleteData);
};
