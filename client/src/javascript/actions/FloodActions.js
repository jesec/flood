import axios from 'axios';
import historySnapshotTypes from 'universally-shared-code/constants/historySnapshotTypes';
import serverEventTypes from 'universally-shared-code/constants/serverEventTypes';

import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import ConfigStore from '../stores/ConfigStore';

const baseURI = ConfigStore.getBaseURI();

let activityStreamEventSource = null;
let lastActivityStreamOptions = undefined;
let visibilityChangeTimeout = null;

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

const FloodActions = {
  clearNotifications: options => {
    return axios
      .delete(`${baseURI}api/notifications`)
      .then((json = {}) => json.data)
      .then(
        (response = {}) => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.FLOOD_CLEAR_NOTIFICATIONS_SUCCESS,
            data: {
              ...response,
              ...options,
            },
          });
        },
        error => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.FLOOD_CLEAR_NOTIFICATIONS_ERROR,
            data: {
              error,
            },
          });
        }
      );
  },

  closeActivityStream() {
    activityStreamEventSource.close();

    activityStreamEventSource.removeEventListener(
      serverEventTypes.CLIENT_CONNECTIVITY_STATUS_CHANGE,
      this.handleClientConnectivityStatusChange
    );

    activityStreamEventSource.removeEventListener(
      serverEventTypes.NOTIFICATION_COUNT_CHANGE,
      this.handleNotificationCountChange
    );

    activityStreamEventSource.removeEventListener(serverEventTypes.TAXONOMY_DIFF_CHANGE, this.handleTaxonomyDiffChange);

    activityStreamEventSource.removeEventListener(serverEventTypes.TAXONOMY_FULL_UPDATE, this.handleTaxonomyFullUpdate);

    activityStreamEventSource.removeEventListener(
      serverEventTypes.TORRENT_LIST_DIFF_CHANGE,
      this.handleTorrentListDiffChange
    );

    activityStreamEventSource.removeEventListener(
      serverEventTypes.TORRENT_LIST_FULL_UPDATE,
      this.handleTorrentListFullUpdate
    );

    activityStreamEventSource.removeEventListener(
      serverEventTypes.TRANSFER_SUMMARY_DIFF_CHANGE,
      this.handleTransferSummaryDiffChange
    );

    activityStreamEventSource.removeEventListener(
      serverEventTypes.TRANSFER_SUMMARY_FULL_UPDATE,
      this.handleTransferSummaryFullUpdate
    );

    activityStreamEventSource.removeEventListener(
      serverEventTypes.TRANSFER_HISTORY_FULL_UPDATE,
      this.handleTransferHistoryFullUpdate
    );

    activityStreamEventSource = null;
  },

  fetchDirectoryList: (options = {}) => {
    return axios
      .get(`${baseURI}api/directory-list`, {
        params: options,
      })
      .then((json = {}) => json.data)
      .then(
        response => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.FLOOD_FETCH_DIRECTORY_LIST_SUCCESS,
            data: {
              ...options,
              ...response,
            },
          });
        },
        (error = {}) => {
          const {response: errorData} = error;

          AppDispatcher.dispatchServerAction({
            type: ActionTypes.FLOOD_FETCH_DIRECTORY_LIST_ERROR,
            error: errorData,
          });
        }
      );
  },

  fetchMediainfo: options => {
    return axios
      .get(`${baseURI}api/mediainfo`, {
        params: {
          hash: options.hash,
        },
      })
      .then((json = {}) => json.data)
      .then(
        response => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.FLOOD_FETCH_MEDIAINFO_SUCCESS,
            data: {
              ...response,
              ...options,
            },
          });
        },
        error => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.FLOOD_FETCH_MEDIAINFO_ERROR,
            error,
          });
        }
      );
  },

  fetchNotifications: options => {
    return axios
      .get(`${baseURI}api/notifications`, {
        params: {
          limit: options.limit,
          start: options.start,
        },
      })
      .then((json = {}) => json.data)
      .then(
        response => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.FLOOD_FETCH_NOTIFICATIONS_SUCCESS,
            data: {
              ...response,
              ...options,
            },
          });
        },
        error => {
          AppDispatcher.dispatchServerAction({
            type: ActionTypes.FLOOD_FETCH_NOTIFICATIONS_ERROR,
            data: {
              error,
            },
          });
        }
      );
  },

  handleClientConnectivityStatusChange(event) {
    AppDispatcher.dispatchServerAction({
      type: ActionTypes.CLIENT_CONNECTIVITY_STATUS_CHANGE,
      data: JSON.parse(event.data),
    });
  },

  handleNotificationCountChange(event) {
    AppDispatcher.dispatchServerAction({
      type: ActionTypes.NOTIFICATION_COUNT_CHANGE,
      data: JSON.parse(event.data),
    });
  },

  handleTorrentListDiffChange(event) {
    AppDispatcher.dispatchServerAction({
      type: ActionTypes.TORRENT_LIST_DIFF_CHANGE,
      data: JSON.parse(event.data),
    });
  },

  handleTorrentListFullUpdate(event) {
    AppDispatcher.dispatchServerAction({
      type: ActionTypes.TORRENT_LIST_FULL_UPDATE,
      data: JSON.parse(event.data),
    });
  },

  handleTaxonomyDiffChange(event) {
    AppDispatcher.dispatchServerAction({
      type: ActionTypes.TAXONOMY_DIFF_CHANGE,
      data: JSON.parse(event.data),
    });
  },

  handleTaxonomyFullUpdate(event) {
    AppDispatcher.dispatchServerAction({
      type: ActionTypes.TAXONOMY_FULL_UPDATE,
      data: JSON.parse(event.data),
    });
  },

  handleTransferSummaryDiffChange(event) {
    AppDispatcher.dispatchServerAction({
      type: ActionTypes.TRANSFER_SUMMARY_DIFF_CHANGE,
      data: JSON.parse(event.data),
    });
  },

  handleTransferSummaryFullUpdate(event) {
    AppDispatcher.dispatchServerAction({
      type: ActionTypes.TRANSFER_SUMMARY_FULL_UPDATE,
      data: JSON.parse(event.data),
    });
  },

  handleTransferHistoryFullUpdate(event) {
    AppDispatcher.dispatchServerAction({
      type: ActionTypes.TRANSFER_HISTORY_FULL_UPDATE,
      data: JSON.parse(event.data),
    });
  },

  restartActivityStream() {
    this.closeActivityStream();
    this.startActivityStream(lastActivityStreamOptions);
  },

  startActivityStream(options = {}) {
    const {historySnapshot = historySnapshotTypes.FIVE_MINUTE} = options;
    const didHistorySnapshotChange =
      lastActivityStreamOptions && lastActivityStreamOptions.historySnapshot !== historySnapshot;

    lastActivityStreamOptions = options;

    // When the user requests a new history snapshot during an open session,
    // we need to close and re-open the event stream.
    if (didHistorySnapshotChange && activityStreamEventSource !== null) {
      this.closeActivityStream();
    }

    // If the user requested a new history snapshot, or the event source has not
    // alraedy been created, we open the event stream.
    if (didHistorySnapshotChange || activityStreamEventSource === null) {
      activityStreamEventSource = new EventSource(`${baseURI}api/activity-stream?historySnapshot=${historySnapshot}`);

      activityStreamEventSource.addEventListener(
        serverEventTypes.CLIENT_CONNECTIVITY_STATUS_CHANGE,
        this.handleClientConnectivityStatusChange
      );

      activityStreamEventSource.addEventListener(
        serverEventTypes.NOTIFICATION_COUNT_CHANGE,
        this.handleNotificationCountChange
      );

      activityStreamEventSource.addEventListener(serverEventTypes.TAXONOMY_DIFF_CHANGE, this.handleTaxonomyDiffChange);

      activityStreamEventSource.addEventListener(serverEventTypes.TAXONOMY_FULL_UPDATE, this.handleTaxonomyFullUpdate);

      activityStreamEventSource.addEventListener(
        serverEventTypes.TORRENT_LIST_DIFF_CHANGE,
        this.handleTorrentListDiffChange
      );

      activityStreamEventSource.addEventListener(
        serverEventTypes.TORRENT_LIST_FULL_UPDATE,
        this.handleTorrentListFullUpdate
      );

      activityStreamEventSource.addEventListener(
        serverEventTypes.TRANSFER_SUMMARY_DIFF_CHANGE,
        this.handleTransferSummaryDiffChange
      );

      activityStreamEventSource.addEventListener(
        serverEventTypes.TRANSFER_SUMMARY_FULL_UPDATE,
        this.handleTransferSummaryFullUpdate
      );

      activityStreamEventSource.addEventListener(
        serverEventTypes.TRANSFER_HISTORY_FULL_UPDATE,
        this.handleTransferHistoryFullUpdate
      );
    }
  },
};

export default FloodActions;
