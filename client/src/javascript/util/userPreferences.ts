import type {FloodSettings} from '@shared/types/FloodSettings';
import type {TorrentProperties} from '@shared/types/Torrent';

import SettingActions from '../actions/SettingActions';
import SettingStore from '../stores/SettingStore';

export const saveAddTorrentsUserPreferences = ({
  start,
  destination,
  tags,
  tab,
}: {
  start?: FloodSettings['startTorrentsOnLoad'];
  destination?: string;
  tags?: TorrentProperties['tags'];
  tab?: FloodSettings['UITorrentsAddTab'];
}) => {
  const changedSettings: Partial<FloodSettings> = {};

  if (start != null) {
    changedSettings.startTorrentsOnLoad = start;
  }

  if (destination != null && destination !== '') {
    if (changedSettings.torrentDestinations == null) {
      changedSettings.torrentDestinations = SettingStore.floodSettings.torrentDestinations || {};
    }

    if (typeof tags?.[0] === 'string') {
      changedSettings.torrentDestinations[tags[0]] = destination;
    } else {
      changedSettings.torrentDestinations[''] = destination;
    }
  }

  if (tab != null) {
    changedSettings.UITorrentsAddTab = tab;
  }

  SettingActions.saveSettings(changedSettings);
};

export const saveDeleteTorrentsUserPreferences = ({deleteData}: {deleteData?: boolean}) => {
  if (deleteData != null) {
    SettingActions.saveSetting('deleteTorrentData', deleteData);
  }
};
