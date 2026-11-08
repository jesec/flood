import {compareStructural, reaction} from 'mobx';
import debounce from 'lodash/debounce';

import SettingActions from '@client/actions/SettingActions';
import SettingStore from '@client/stores/SettingStore';
import TorrentFilterStore, {SidebarFilterSelection} from '@client/stores/TorrentFilterStore';

const SAVE_DELAY_MS = 500;

const saveSelection = debounce((selection: SidebarFilterSelection) => {
  SettingActions.saveSettings({UISidebarFilterSelection: selection});
}, SAVE_DELAY_MS);

// Saves the sidebar filter selection to the user's settings whenever it changes,
// as long as the user has enabled "remember sidebar filters".
const startSidebarFilterPersistence = (): (() => void) => {
  const dispose = reaction(
    () => [SettingStore.floodSettings.UISidebarFilterRemember, TorrentFilterStore.selection] as const,
    ([isRememberEnabled, selection]) => {
      if (!isRememberEnabled) {
        saveSelection.cancel();
        return;
      }

      // Skip saves that would not change anything, e.g. right after a restore.
      if (JSON.stringify(selection) === JSON.stringify(SettingStore.floodSettings.UISidebarFilterSelection)) {
        saveSelection.cancel();
        return;
      }

      saveSelection(selection);
    },
    {equals: compareStructural},
  );

  return () => {
    saveSelection.cancel();
    dispose();
  };
};

export default startSidebarFilterPersistence;
