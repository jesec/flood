/**
 * Mock SettingActions for Storybook
 * Updates both MockStateStore AND MobX stores for proper component updates
 */

import type {ClientSettings} from '@shared/types/ClientSettings';
import type {FloodSettings} from '@shared/types/FloodSettings';

import SettingStore from '../../client/src/javascript/stores/SettingStore';
import mockStateStore from './MockStateStore';

const SettingActions = {
  // Save Flood UI settings
  saveSetting: async (settings: Partial<FloodSettings>) => {
    console.log('[MockSettingActions] Saving Flood settings:', settings);

    // Update MockStateStore
    const state = mockStateStore.getState();
    const newSettings = {...state.settings, ...settings};
    mockStateStore.setState({settings: newSettings});

    // Update MobX store - this is for Flood settings
    SettingStore.saveFloodSettings(settings);

    return Promise.resolve();
  },

  // Fetch Flood UI settings
  fetchSettings: async () => {
    console.log('[MockSettingActions] Fetching Flood settings');
    const state = mockStateStore.getState();

    // Update MobX store
    SettingStore.handleSettingsFetchSuccess(state.settings);

    return Promise.resolve();
  },

  // Save torrent client settings
  saveClientSettings: async (settings: Partial<ClientSettings>) => {
    console.log('[MockSettingActions] Saving client settings:', settings);

    // Update MockStateStore
    const state = mockStateStore.getState();
    const newClientSettings = {...state.clientSettings, ...settings};
    mockStateStore.setState({clientSettings: newClientSettings});

    // Update MobX store - this is for client settings
    SettingStore.saveClientSettings(settings);

    return Promise.resolve();
  },

  // Fetch torrent client settings
  fetchClientSettings: async () => {
    console.log('[MockSettingActions] Fetching client settings');
    const state = mockStateStore.getState();

    // Update MobX store
    SettingStore.handleClientSettingsFetchSuccess(state.clientSettings);

    return Promise.resolve();
  },
};

export default SettingActions;
