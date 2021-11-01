import axios from 'axios';

import ClientStatusStore from '@client/stores/ClientStatusStore';
import ConfigStore from '@client/stores/ConfigStore';
import DiskUsageStore from '@client/stores/DiskUsageStore';
import NotificationStore from '@client/stores/NotificationStore';
import TorrentFilterStore from '@client/stores/TorrentFilterStore';
import TorrentStore from '@client/stores/TorrentStore';
import TransferDataStore from '@client/stores/TransferDataStore';
import UIStore from '@client/stores/UIStore';

import type {DirectoryListResponse} from '@shared/types/api';
import type {NotificationFetchOptions, NotificationState} from '@shared/types/Notification';
import type {ServerEvents} from '@shared/types/ServerEvents';

const {baseURI} = ConfigStore;

let activityStreamEventSource: EventSource | null = null;
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
    return axios.delete(`${baseURI}api/notifications`).then(
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

  fetchDirectoryList: (path: string) =>
    axios
      .get<DirectoryListResponse>(`${baseURI}api/directory-list`, {
        params: {path},
      })
      .then((res) => res.data),

  fetchNotifications: (options: NotificationFetchOptions) =>
    axios
      .get<NotificationState>(`${baseURI}api/notifications`, {
        params: options,
      })
      .then(
        ({data}) => {
          NotificationStore.handleNotificationsFetchSuccess(data);
        },
        () => {
          // do nothing.
        },
      ),

  restartActivityStream() {
    this.closeActivityStream();
    this.startActivityStream();
  },

  startActivityStream() {
    // If the user requested a new history snapshot, or the event source has not
    // alraedy been created, we open the event stream.
    if (activityStreamEventSource == null) {
      activityStreamEventSource = new EventSource(`${baseURI}api/activity-stream`);

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
      FloodActions.startActivityStream();
    }
  }
};

global.document.addEventListener('visibilitychange', handleWindowVisibilityChange);

export default FloodActions;
