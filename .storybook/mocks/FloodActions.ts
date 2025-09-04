/**
 * Mock FloodActions for Storybook
 *
 * This mocks FloodActions to simulate API responses without real EventSource/network calls
 * All state is managed through the centralized MockStateStore
 */

import type {Notification} from '@shared/types/Notification';

import ClientStatusStore from '../../client/src/javascript/stores/ClientStatusStore';
import ConfigStore from '../../client/src/javascript/stores/ConfigStore';
import DiskUsageStore from '../../client/src/javascript/stores/DiskUsageStore';
import NotificationStore from '../../client/src/javascript/stores/NotificationStore';
import SettingStore from '../../client/src/javascript/stores/SettingStore';
import TorrentFilterStore from '../../client/src/javascript/stores/TorrentFilterStore';
import TorrentStore from '../../client/src/javascript/stores/TorrentStore';
import TransferDataStore from '../../client/src/javascript/stores/TransferDataStore';
import UIStore from '../../client/src/javascript/stores/UIStore';
import {MOCK_DIRECTORY_LIST, MOCK_DISK_USAGE} from './_fixtures';
import mockStateStore from './MockStateStore';

const FloodActions = {
  startActivityStream() {
    console.log('[MockFloodActions] Starting activity stream');

    // Use setTimeout to ensure this runs after component mount
    setTimeout(() => {
      console.log('[MockFloodActions] Loading data from MockStateStore');

      // Initialize ConfigStore with mock config
      if (typeof ConfigStore.handlePreloadConfigs === 'function') {
        ConfigStore.handlePreloadConfigs({
          authMethod: 'default',
          pollInterval: 5000,
        });
        console.log('[MockFloodActions] ConfigStore authMethod set to:', ConfigStore.authMethod);
      } else {
        console.error('[MockFloodActions] ConfigStore.handlePreloadConfigs not found!');
      }

      const state = mockStateStore.getState();
      console.log('[MockFloodActions] State has torrents:', Object.keys(state.torrents).length);

      // Update client connectivity status FIRST - this affects torrent list rendering
      ClientStatusStore.handleConnectivityStatusChange({isConnected: true});
      console.log('[MockFloodActions] Set ClientStatusStore.isConnected = true');

      // Update disk usage from fixtures
      DiskUsageStore.setDiskUsage(MOCK_DISK_USAGE);

      // Update notification count
      console.log('[MockFloodActions] Sending notifications:', state.notifications.length);
      NotificationStore.handleNotificationCountChange({
        total: state.notifications.length,
        unread: state.notifications.filter((n: Notification) => !n.read).length,
        read: state.notifications.filter((n: Notification) => n.read).length,
      });
      // Also send the actual notifications
      NotificationStore.handleNotificationsFetchSuccess({
        count: {
          total: state.notifications.length,
          unread: state.notifications.filter((n: Notification) => !n.read).length,
          read: state.notifications.filter((n: Notification) => n.read).length,
        },
        notifications: state.notifications,
      });
      console.log('[MockFloodActions] NotificationStore.hasNotification:', NotificationStore.hasNotification);
      console.log('[MockFloodActions] NotificationStore.notificationCount:', NotificationStore.notificationCount);
      UIStore.satisfyDependency('notifications');

      // Send full torrent list update - THIS IS THE CRITICAL PART
      console.log('[MockFloodActions] Sending torrents to TorrentStore:', Object.keys(state.torrents));
      TorrentStore.handleTorrentListFullUpdate(state.torrents);

      // Force a check to see if torrents were received
      setTimeout(() => {
        const torrentCount = TorrentStore.torrents ? Object.keys(TorrentStore.torrents).length : 0;
        console.log('[MockFloodActions] TorrentStore now has', torrentCount, 'torrents');
        console.log(
          '[MockFloodActions] TorrentStore.filteredTorrents has',
          TorrentStore.filteredTorrents?.length || 0,
          'items',
        );
      }, 100);

      UIStore.satisfyDependency('torrent-list');

      // Send settings update
      SettingStore.handleSettingsFetchSuccess(state.settings);

      // Send taxonomy update - computed by MockStateStore
      console.log('[MockFloodActions] Sending taxonomy with counts:', {
        status: Object.keys(state.taxonomy.statusCounts),
        tags: Object.keys(state.taxonomy.tagCounts),
      });
      TorrentFilterStore.handleTorrentTaxonomyFullUpdate(state.taxonomy);
      UIStore.satisfyDependency('torrent-taxonomy');

      // Send transfer data
      TransferDataStore.handleTransferSummaryFullUpdate(state.transferSummary);
      UIStore.satisfyDependency('transfer-data');

      TransferDataStore.handleFetchTransferHistorySuccess(state.transferHistory);
      UIStore.satisfyDependency('transfer-history');
    }, 0);
  },

  closeActivityStream() {
    console.log('[MockFloodActions] Closing activity stream');
  },

  restartActivityStream() {
    this.closeActivityStream();
    this.startActivityStream();
  },

  clearNotifications() {
    mockStateStore.setState({notifications: []});
    return Promise.resolve();
  },

  fetchNotifications() {
    return Promise.resolve(mockStateStore.getState().notifications);
  },

  fetchDirectoryList(path: string) {
    const directories = MOCK_DIRECTORY_LIST[path as keyof typeof MOCK_DIRECTORY_LIST] || [];
    return Promise.resolve({
      path,
      directories,
      files: [],
    });
  },
};

export default FloodActions;
