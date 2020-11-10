import axios from 'axios';

import type {HistorySnapshot} from '@shared/constants/historySnapshotTypes';
import type {NotificationFetchOptions} from '@shared/types/Notification';
import type {ServerEvents} from '@shared/types/ServerEvents';

import ClientStatusStore from '../stores/ClientStatusStore';
import ConfigStore from '../stores/ConfigStore';
import DiskUsageStore from '../stores/DiskUsageStore';
import NotificationStore from '../stores/NotificationStore';
import TorrentFilterStore from '../stores/TorrentFilterStore';
import TorrentStore from '../stores/TorrentStore';
import TransferDataStore from '../stores/TransferDataStore';
import UIStore from '../stores/UIStore';

interface ActivityStreamOptions {
  historySnapshot: HistorySnapshot;
}

const {baseURI} = ConfigStore;

let activityStreamEventSource: EventSource | null = null;
let lastActivityStreamOptions: ActivityStreamOptions;
let visibilityChangeTimeout: NodeJS.Timeout;

// TODO: Use standard Event interfaces
const ServerEventHandlers: Record<keyof ServerEvents, (event: unknown) => void> = {
  CLIENT_CONNECTIVITY_STATUS_CHANGE: (event: unknown) => {
    ClientStatusStore.handleConnectivityStatusChange(JSON.parse((event as {data: string}).data));
  },

  DISK_USAGE_CHANGE: (event: unknown) => {
    DiskUsageStore.setDiskUsage(JSON.parse((event as {data: string}).data));
  },

  NOTIFICATION_COUNT_CHANGE: (event: unknown) => {
    NotificationStore.handleNotificationCountChange(JSON.parse((event as {data: string}).data));
    UIStore.satisfyDependency('notifications');
  },

  TORRENT_LIST_DIFF_CHANGE: (event: unknown) => {
    TorrentStore.handleTorrentListDiffChange(JSON.parse((event as {data: string}).data));
  },

  TORRENT_LIST_FULL_UPDATE: (event: unknown) => {
    TorrentStore.handleTorrentListFullUpdate(JSON.parse((event as {data: string}).data));
    UIStore.satisfyDependency('torrent-list');
  },

  TAXONOMY_DIFF_CHANGE: (event: unknown) => {
    TorrentFilterStore.handleTorrentTaxonomyDiffChange(JSON.parse((event as {data: string}).data));
  },

  TAXONOMY_FULL_UPDATE: (event: unknown) => {
    TorrentFilterStore.handleTorrentTaxonomyFullUpdate(JSON.parse((event as {data: string}).data));
    UIStore.satisfyDependency('torrent-taxonomy');
  },

  TRANSFER_SUMMARY_DIFF_CHANGE: (event: unknown) => {
    TransferDataStore.handleTransferSummaryDiffChange(JSON.parse((event as {data: string}).data));
  },

  TRANSFER_SUMMARY_FULL_UPDATE: (event: unknown) => {
    TransferDataStore.handleTransferSummaryFullUpdate(JSON.parse((event as {data: string}).data));
    UIStore.satisfyDependency('transfer-data');
  },

  TRANSFER_HISTORY_FULL_UPDATE: (event: unknown) => {
    TransferDataStore.handleFetchTransferHistorySuccess(JSON.parse((event as {data: string}).data));
    UIStore.satisfyDependency('transfer-history');
  },
} as const;

const FloodActions = {
  clearNotifications: () => {
    NotificationStore.clearAll();
    return axios
      .delete(`${baseURI}api/notifications`)
      .then((json) => json.data)
      .then(
        () => {
          // do nothing.
        },
        () => {
          // do nothing.
        },
      );
  },

  closeActivityStream() {
    if (activityStreamEventSource == null) {
      return;
    }

    activityStreamEventSource.close();

    Object.entries(ServerEventHandlers).forEach(([event, handler]) => {
      if (activityStreamEventSource != null) {
        activityStreamEventSource.removeEventListener(event, handler);
      }
    });

    activityStreamEventSource = null;
  },

  fetchDirectoryList: (options = {}) =>
    axios
      .get(`${baseURI}api/directory-list`, {
        params: options,
      })
      .then((json) => json.data)
      .then((response) => {
        return {
          ...options,
          ...response,
        };
      }),

  fetchNotifications: (options: NotificationFetchOptions) =>
    axios
      .get(`${baseURI}api/notifications`, {
        params: {
          limit: options.limit,
          start: options.start,
        },
      })
      .then((json) => json.data)
      .then(
        (data) => {
          NotificationStore.handleNotificationsFetchSuccess(data);
        },
        () => {
          // do nothing.
        },
      ),

  restartActivityStream() {
    this.closeActivityStream();
    this.startActivityStream(lastActivityStreamOptions);
  },

  startActivityStream(options: ActivityStreamOptions = {historySnapshot: 'FIVE_MINUTE'}) {
    const {historySnapshot} = options;
    const didHistorySnapshotChange =
      lastActivityStreamOptions && lastActivityStreamOptions.historySnapshot !== historySnapshot;

    lastActivityStreamOptions = options;

    // When the user requests a new history snapshot during an open session,
    // we need to close and re-open the event stream.
    if (didHistorySnapshotChange && activityStreamEventSource != null) {
      this.closeActivityStream();
    }

    // If the user requested a new history snapshot, or the event source has not
    // alraedy been created, we open the event stream.
    if (didHistorySnapshotChange || activityStreamEventSource == null) {
      activityStreamEventSource = new EventSource(`${baseURI}api/activity-stream?historySnapshot=${historySnapshot}`);

      Object.entries(ServerEventHandlers).forEach(([event, handler]) => {
        if (activityStreamEventSource != null) {
          activityStreamEventSource.addEventListener(event, handler);
        }
      });
    }
  },
} as const;

const handleProlongedInactivity = () => {
  FloodActions.closeActivityStream();
};

const handleWindowVisibilityChange = () => {
  if (global.document.hidden) {
    // After 30 seconds of inactivity, we stop the event stream.
    visibilityChangeTimeout = global.setTimeout(handleProlongedInactivity, 1000 * 30);
  } else {
    global.clearTimeout(visibilityChangeTimeout);

    if (activityStreamEventSource == null) {
      FloodActions.startActivityStream(lastActivityStreamOptions);
    }
  }
};

global.document.addEventListener('visibilitychange', handleWindowVisibilityChange);

export default FloodActions;
