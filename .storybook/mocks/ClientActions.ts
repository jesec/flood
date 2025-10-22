/**
 * Mock ClientActions for Storybook
 * Simulates torrent client actions without real API calls
 * Updates both MockStateStore AND MobX stores for proper component updates
 */

import SettingStore from '@client/stores/SettingStore';
import type {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import type {ClientSettings} from '@shared/types/ClientSettings';

import mockStateStore from './MockStateStore';

const ClientActions = {
  fetchSettings: async () => {
    console.log('[MockClientActions] Fetching client settings');
    const state = mockStateStore.getState();

    // Update MobX store so components re-render
    SettingStore.handleClientSettingsFetchSuccess(state.clientSettings);

    return Promise.resolve();
  },

  saveSettings: async (settings: Partial<ClientSettings>, _options?: {alert?: boolean}) => {
    console.log('[MockClientActions] Saving client settings:', settings);

    // Update mock state
    const state = mockStateStore.getState();
    const newSettings = {...state.clientSettings, ...settings};
    mockStateStore.setState({clientSettings: newSettings});

    // Update MobX store so components re-render
    SettingStore.saveClientSettings(settings);

    return Promise.resolve();
  },

  saveSetting: async <K extends keyof ClientSettings>(property: K, value: ClientSettings[K]) => {
    return ClientActions.saveSettings({[property]: value});
  },

  setSpeedLimits: ({direction, throttle}: {direction: 'upload' | 'download'; throttle: number}) => {
    console.log('[MockClientActions] Setting speed limit:', direction, throttle);

    // Update mock state
    const state = mockStateStore.getState();
    const newLimits = {...state.speedLimits};
    newLimits[direction] = throttle;
    mockStateStore.setState({speedLimits: newLimits});

    // Note: Speed limits are separate from client settings in the real app
    // They might need special handling depending on the torrent client

    return Promise.resolve();
  },

  getSpeedLimits: () => {
    console.log('[MockClientActions] Getting speed limits');
    const state = mockStateStore.getState();
    return Promise.resolve({
      download: state.speedLimits.download,
      upload: state.speedLimits.upload,
    });
  },

  testConnection: (connectionSettings: ClientConnectionSettings) => {
    console.log('[MockClientActions] Testing connection:', connectionSettings);
    // Always succeed in Storybook
    return Promise.resolve({
      isConnected: true,
    });
  },

  setClientSettings: (settings: Partial<ClientSettings>) => {
    console.log('[MockClientActions] Setting client settings:', settings);

    // Update mock state
    const state = mockStateStore.getState();
    const newSettings = {...state.clientSettings, ...settings};
    mockStateStore.setState({clientSettings: newSettings});

    // Update MobX store so components re-render
    SettingStore.saveClientSettings(settings);

    return Promise.resolve();
  },

  getClientSettings: () => {
    console.log('[MockClientActions] Getting client settings');
    const state = mockStateStore.getState();

    // Update MobX store so components have the data
    SettingStore.handleClientSettingsFetchSuccess(state.clientSettings);

    return Promise.resolve(state.clientSettings);
  },

  shutdown: () => {
    console.log('[MockClientActions] Shutting down client');
    return Promise.resolve();
  },

  restart: () => {
    console.log('[MockClientActions] Restarting client');
    return Promise.resolve();
  },
};

export default ClientActions;
