import axios from 'axios';

import type {HistorySnapshot} from '@shared/constants/historySnapshotTypes';
import type {NotificationFetchOptions} from '@shared/types/Notification';
import type {ServerEvents} from '@shared/types/ServerEvents';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ConfigStore from '../stores/ConfigStore';

interface ActivityStreamOptions {
  historySnapshot: HistorySnapshot;
}

const baseURI = ConfigStore.getBaseURI();

let activityStreamEventSource: EventSource | null = null;
let lastActivityStreamOptions: ActivityStreamOptions;
let visibilityChangeTimeout: NodeJS.Timeout;

// TODO: Use standard Event interfaces
const ServerEventHandlers: Record<keyof ServerEvents, (event: unknown) => void> = {
  CLIENT_CONNECTIVITY_STATUS_CHANGE: (event: unknown) => {
    AppDispatcher.dispatchServerAction({
      type: 'CLIENT_CONNECTIVITY_STATUS_CHANGE',
      data: JSON.parse((event as {data: string}).data),
    });
  },

  DISK_USAGE_CHANGE: (event: unknown) => {
    AppDispatcher.dispatchServerAction({
      type: 'DISK_USAGE_CHANGE',
      data: JSON.parse((event as {data: string}).data),
    });
  },

  NOTIFICATION_COUNT_CHANGE: (event: unknown) => {
    AppDispatcher.dispatchServerAction({
      type: 'NOTIFICATION_COUNT_CHANGE',
      data: JSON.parse((event as {data: string}).data),
    });
  },

  TORRENT_LIST_DIFF_CHANGE: (event: unknown) => {
    AppDispatcher.dispatchServerAction({
      type: 'TORRENT_LIST_DIFF_CHANGE',
      data: JSON.parse((event as {data: string}).data),
    });
  },

  TORRENT_LIST_FULL_UPDATE: (event: unknown) => {
    AppDispatcher.dispatchServerAction({
      type: 'TORRENT_LIST_FULL_UPDATE',
      data: JSON.parse((event as {data: string}).data),
    });
  },

  TAXONOMY_DIFF_CHANGE: (event: unknown) => {
    AppDispatcher.dispatchServerAction({
      type: 'TAXONOMY_DIFF_CHANGE',
      data: JSON.parse((event as {data: string}).data),
    });
  },

  TAXONOMY_FULL_UPDATE: (event: unknown) => {
    AppDispatcher.dispatchServerAction({
      type: 'TAXONOMY_FULL_UPDATE',
      data: JSON.parse((event as {data: string}).data),
    });
  },

  TRANSFER_SUMMARY_DIFF_CHANGE: (event: unknown) => {
    AppDispatcher.dispatchServerAction({
      type: 'TRANSFER_SUMMARY_DIFF_CHANGE',
      data: JSON.parse((event as {data: string}).data),
    });
  },

  TRANSFER_SUMMARY_FULL_UPDATE: (event: unknown) => {
    AppDispatcher.dispatchServerAction({
      type: 'TRANSFER_SUMMARY_FULL_UPDATE',
      data: JSON.parse((event as {data: string}).data),
    });
  },

  TRANSFER_HISTORY_FULL_UPDATE: (event: unknown) => {
    AppDispatcher.dispatchServerAction({
      type: 'TRANSFER_HISTORY_FULL_UPDATE',
      data: JSON.parse((event as {data: string}).data),
    });
  },
};

const FloodActions = {
  clearNotifications: (options: NotificationFetchOptions) =>
    axios
      .delete(`${baseURI}api/notifications`)
      .then((json) => json.data)
      .then(
        (response = {}) => {
          AppDispatcher.dispatchServerAction({
            type: 'FLOOD_CLEAR_NOTIFICATIONS_SUCCESS',
            data: {
              ...response,
              ...options,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'FLOOD_CLEAR_NOTIFICATIONS_ERROR',
            data: {
              error,
            },
          });
        },
      ),

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
        (response) => {
          AppDispatcher.dispatchServerAction({
            type: 'FLOOD_FETCH_NOTIFICATIONS_SUCCESS',
            data: {
              ...response,
              ...options,
            },
          });
        },
        (error) => {
          AppDispatcher.dispatchServerAction({
            type: 'FLOOD_FETCH_NOTIFICATIONS_ERROR',
            data: {
              error,
            },
          });
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
      import(/* webpackPrefetch: true */ '../stores/ClientStatusStore');
      import(/* webpackPrefetch: true */ '../stores/DiskUsageStore');
      import(/* webpackPrefetch: true */ '../stores/NotificationStore');
      import(/* webpackPrefetch: true */ '../stores/TorrentStore');
      import(/* webpackPrefetch: true */ '../stores/TorrentFilterStore');
      import(/* webpackPrefetch: true */ '../stores/TransferDataStore');
      import(/* webpackPrefetch: true */ '../stores/UIStore');
      activityStreamEventSource = new EventSource(`${baseURI}api/activity-stream?historySnapshot=${historySnapshot}`);

      Object.entries(ServerEventHandlers).forEach(([event, handler]) => {
        if (activityStreamEventSource != null) {
          activityStreamEventSource.addEventListener(event, handler);
        }
      });
    }
  },
};

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
