/**
 * Mock FloodActions for Storybook
 *
 * This mocks FloodActions to simulate API responses without real EventSource/network calls
 * All state is managed through the centralized MockStateStore
 */

import type {Notification} from '@shared/types/Notification';
import {compare} from 'fast-json-patch';

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

// Store interval IDs for cleanup
let updateInterval: NodeJS.Timeout | null = null;
let previousTorrentState: any = null;
let activityStreamTimeout: NodeJS.Timeout | null = null;

// Global cleanup function to ensure clean state
const cleanupAll = () => {
  console.log('[MockFloodActions] Running global cleanup');

  // Clear all timers
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  if (activityStreamTimeout) {
    clearTimeout(activityStreamTimeout);
    activityStreamTimeout = null;
  }

  // Reset state tracking
  previousTorrentState = null;
};

const FloodActions = {
  startActivityStream() {
    // Always cleanup before starting new stream
    cleanupAll();

    console.log('[MockFloodActions] Starting activity stream');

    // Use setTimeout to ensure this runs after component mount
    activityStreamTimeout = setTimeout(() => {
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

      // Store initial state for diff updates
      previousTorrentState = JSON.parse(JSON.stringify(state.torrents));

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

  /**
   * Start dynamic updates to simulate real-time changes
   * Call this after startActivityStream for stories that need dynamic updates
   */
  startDynamicUpdates(updateIntervalMs: number = 2000) {
    if (updateInterval) {
      clearInterval(updateInterval);
    }

    console.log('[MockFloodActions] Starting dynamic updates every', updateIntervalMs, 'ms');

    updateInterval = setInterval(() => {
      const state = mockStateStore.getState();

      // Check if there are any changes using fast-json-patch
      if (previousTorrentState) {
        const patches = compare(previousTorrentState, state.torrents);

        if (patches.length > 0) {
          console.log('[MockFloodActions] Sending', patches.length, 'diff patches');
          TorrentStore.handleTorrentListDiffChange(patches);
          previousTorrentState = JSON.parse(JSON.stringify(state.torrents));
        }
      }

      // Update transfer rates
      TransferDataStore.handleTransferSummaryFullUpdate(state.transferSummary);

      // Update taxonomy if needed
      TorrentFilterStore.handleTorrentTaxonomyFullUpdate(state.taxonomy);

      // Update notifications - send both count AND the actual notifications
      const notificationState = {
        total: state.notifications.length,
        unread: state.notifications.filter((n: Notification) => !n.read).length,
        read: state.notifications.filter((n: Notification) => n.read).length,
      };
      NotificationStore.handleNotificationCountChange(notificationState);

      // IMPORTANT: Also send the actual notifications so the dropdown can display them
      NotificationStore.handleNotificationsFetchSuccess({
        count: notificationState,
        notifications: state.notifications,
      });
    }, updateIntervalMs);
  },

  stopDynamicUpdates() {
    if (updateInterval) {
      console.log('[MockFloodActions] Stopping dynamic updates');
      clearInterval(updateInterval);
      updateInterval = null;
    }
  },

  closeActivityStream() {
    console.log('[MockFloodActions] Closing activity stream');
    cleanupAll();
  },

  restartActivityStream() {
    console.log('[MockFloodActions] Restarting activity stream');
    cleanupAll();
    this.startActivityStream();
  },

  clearNotifications() {
    mockStateStore.setState({notifications: []});
    return Promise.resolve();
  },

  fetchNotifications() {
    const notifications = mockStateStore.getState().notifications;
    console.log('[MockFloodActions] fetchNotifications called, returning', notifications.length, 'notifications');

    // Also update the store when notifications are fetched (like real FloodActions does)
    NotificationStore.handleNotificationsFetchSuccess({
      count: {
        total: notifications.length,
        unread: notifications.filter((n: Notification) => !n.read).length,
        read: notifications.filter((n: Notification) => n.read).length,
      },
      notifications: notifications,
    });

    return Promise.resolve(notifications);
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
