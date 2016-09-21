import _ from 'lodash';

import ActionTypes from '../constants/ActionTypes';
import AlertStore from './AlertStore';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import config from '../../../config';
import EventTypes from '../constants/EventTypes';
import {filterTorrents} from '../util/filterTorrents';
import {searchTorrents} from '../util/searchTorrents';
import {selectTorrents} from '../util/selectTorrents';
import SettingsStore from './SettingsStore';
import {sortTorrents} from '../util/sortTorrents';
import TorrentActions from '../actions/TorrentActions';
import TorrentFilterStore from './TorrentFilterStore';
import UIStore from './UIStore';

class TorrentStoreClass extends BaseStore {
  constructor() {
    super();

    this.filteredTorrents = {};
    this.pollTorrentDetailsIntervalID = null;
    this.pollTorrentsIntervalID = null;
    this.selectedTorrents = [];
    this.sortedTorrents = [];
    this.torrents = {};
  }

  fetchTorrentDetails(options = {}) {
    if (!this.isRequestPending('fetch-torrent-details')
      || options.forceUpdate) {
      this.beginRequest('fetch-torrent-details');
      TorrentActions.fetchTorrentDetails(UIStore.getTorrentDetailsHash());
    }

    if (this.pollTorrentDetailsIntervalID === null) {
      this.startPollingTorrentDetails();
    }
  }

  fetchTorrents() {
    if (!this.isRequestPending('fetch-torrents')) {
      this.beginRequest('fetch-torrents');
      TorrentActions.fetchTorrents();
    }

    if (this.pollTorrentsIntervalID === null) {
      this.startPollingTorrents();
    }
  }

  filterTorrents() {
    let searchFilter = TorrentFilterStore.getSearchFilter();
    let statusFilter = TorrentFilterStore.getStatusFilter();
    let tagFilter = TorrentFilterStore.getTagFilter();
    let trackerFilter = TorrentFilterStore.getTrackerFilter();

    let filteredTorrents = Object.assign([], this.sortedTorrents);

    if (searchFilter && searchFilter !== '') {
      filteredTorrents = searchTorrents(filteredTorrents, searchFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'status',
        filter: statusFilter
      });
    }

    if (tagFilter && tagFilter !== 'all') {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'tag',
        filter: tagFilter
      });
    }

    if (trackerFilter && trackerFilter !== 'all') {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'tracker',
        filter: trackerFilter
      });
    }

    this.filteredTorrents = filteredTorrents;
  }

  getTorrentDetails(hash) {
    return this.torrents[hash].details || null;
  }

  getSelectedTorrents() {
    return this.selectedTorrents;
  }

  getSelectedTorrentsDownloadLocations() {
    return this.selectedTorrents.map((hash) => {
      return this.torrents[hash].basePath;
    });
  }

  getSelectedTorrentsFilename() {
    return this.selectedTorrents.map((hash) => {
      return this.torrents[hash].filename;
    });
  }

  getSelectedTorrentsTags() {
    return this.selectedTorrents.map((hash) => {
      return this.torrents[hash].tags;
    });
  }

  handleAddTorrentError() {
    this.emit(EventTypes.CLIENT_ADD_TORRENT_ERROR);
  }

  handleAddTorrentSuccess(response) {
    this.emit(EventTypes.CLIENT_ADD_TORRENT_SUCCESS);

    SettingsStore.saveFloodSettings({
      id: 'torrentDestination',
      data: response.destination
    });

    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.add',
        value: response.count || 1
      },
      id: 'alert.torrent.add'
    });
  }

  getTorrent(hash) {
    return this.torrents[hash];
  }

  getAllTorrents() {
    return this.torrents;
  }

  getTorrents() {
    // TODO: Audit this filteredTorrents vs sortedTorrents concept.
    if (TorrentFilterStore.isFilterActive()) {
      return this.filteredTorrents;
    }

    return this.sortedTorrents;
  }

  handleMoveTorrentsSuccess(response) {
    this.emit(EventTypes.CLIENT_MOVE_TORRENTS_SUCCESS);

    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.move',
        value: response.count
      },
      id: 'alert.torrent.move',
    });
  }

  handleMoveTorrentsError(error) {
    this.emit(EventTypes.CLIENT_MOVE_TORRENTS_REQUEST_ERROR);

    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.move.failed',
        value: error.count
      },
      id: 'alert.torrent.move.failed'
    });
  }

  setSelectedTorrents(event, hash) {
    this.selectedTorrents = selectTorrents({
      event,
      hash,
      selectedTorrents: this.selectedTorrents,
      torrentList: this.filteredTorrents
    });
    this.emit(EventTypes.UI_TORRENT_SELECTION_CHANGE);
  }

  handleFetchTorrentsError(error) {
    this.resolveRequest('fetch-torrents');
  }

  handleFetchTorrentsSuccess(torrents) {
    this.torrents = torrents;

    this.sortTorrents();
    this.filterTorrents();
    this.resolveRequest('fetch-torrents');

    this.emit(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS);
  }

  handleRemoveTorrentsSuccess(response) {
    SettingsStore.saveFloodSettings({
      id: 'deleteTorrentData',
      data: response.deleteData
    });

    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.remove',
        value: response.count
      },
      id: 'alert.torrent.remove'
    });
  }

  handleRemoveTorrentsError(error) {
    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.remove.failed',
        value: error.count
      },
      id: 'alert.torrent.remove.failed'
    });
  }

  handleSetFilePrioritySuccess() {
    this.emit(EventTypes.CLIENT_SET_FILE_PRIORITY_SUCCESS);
    this.fetchTorrentDetails({forceUpdate: true});
  }

  setFilePriority(hash, fileIndices, priority) {
    TorrentActions.setFilePriority(hash, fileIndices, priority);
  }

  setTorrentDetails(hash, torrentDetails) {
    this.torrents[hash].details = torrentDetails;
    this.resolveRequest('fetch-torrent-details');
    this.emit(EventTypes.CLIENT_TORRENT_DETAILS_CHANGE);
  }

  sortTorrents() {
    let sortBy = TorrentFilterStore.getTorrentsSort();

    // Convert torrents hash to array and sort it.
    this.sortedTorrents = sortTorrents(this.torrents, sortBy);
  }

  startPollingTorrentDetails() {
    this.pollTorrentDetailsIntervalID = setInterval(
      this.fetchTorrentDetails.bind(this),
      config.pollInterval
    );
  }

  startPollingTorrents() {
    this.pollTorrentsIntervalID = setInterval(
      this.fetchTorrents.bind(this), config.pollInterval
    );
  }

  stopPollingTorrentDetails() {
    clearInterval(this.pollTorrentDetailsIntervalID);
    this.pollTorrentDetailsIntervalID = null;
  }

  stopPollingTorrents() {
    clearInterval(this.pollTorrentsIntervalID);
    this.pollTorrentsIntervalID = null;
  }

  triggerTorrentsFilter() {
    this.filterTorrents();
    this.emit(EventTypes.UI_TORRENTS_LIST_FILTERED);
  }

  triggerTorrentsSort() {
    this.sortTorrents();
    this.triggerTorrentsFilter();
  }
}

let TorrentStore = new TorrentStoreClass();

TorrentStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action, source} = payload;

  switch (action.type) {
    case ActionTypes.CLIENT_FETCH_TORRENT_DETAILS_SUCCESS:
      TorrentStore.setTorrentDetails(action.data.hash, action.data.torrentDetails);
      break;
    case ActionTypes.CLIENT_ADD_TORRENT_ERROR:
      TorrentStore.handleAddTorrentError(action.error);
      break;
    case ActionTypes.CLIENT_ADD_TORRENT_SUCCESS:
      TorrentStore.fetchTorrents();
      TorrentStore.handleAddTorrentSuccess(action.data);
      break;
    case ActionTypes.CLIENT_FETCH_TORRENTS_SUCCESS:
      TorrentStore.handleFetchTorrentsSuccess(action.data.torrents);
      break;
    case ActionTypes.CLIENT_FETCH_TORRENTS_ERROR:
      TorrentStore.handleFetchTorrentsError(action.error);
      break;
    case ActionTypes.CLIENT_MOVE_TORRENTS_SUCCESS:
      TorrentStore.handleMoveTorrentsSuccess(action.data);
      break;
    case ActionTypes.CLIENT_MOVE_TORRENTS_ERROR:
      TorrentStore.handleMoveTorrentsError(action.error);
      break;
    case ActionTypes.CLIENT_REMOVE_TORRENT_SUCCESS:
      TorrentStore.fetchTorrents();
      TorrentStore.handleRemoveTorrentsSuccess(action.data);
      break;
    case ActionTypes.CLIENT_REMOVE_TORRENT_ERROR:
      TorrentStore.handleRemoveTorrentsError(action.error);
      break;
    case ActionTypes.CLIENT_SET_FILE_PRIORITY_SUCCESS:
      TorrentStore.handleSetFilePrioritySuccess(action.data);
      break;
    case ActionTypes.UI_CLICK_TORRENT:
      TorrentStore.setSelectedTorrents(action.data.event, action.data.hash);
      break;
    case ActionTypes.UI_SET_TORRENT_SORT:
      TorrentStore.triggerTorrentsSort();
    case ActionTypes.UI_SET_TORRENT_SEARCH_FILTER:
    case ActionTypes.UI_SET_TORRENT_STATUS_FILTER:
    case ActionTypes.UI_SET_TORRENT_TAG_FILTER:
    case ActionTypes.UI_SET_TORRENT_TRACKER_FILTER:
      TorrentStore.triggerTorrentsFilter();
      break;
    case ActionTypes.CLIENT_START_TORRENT_SUCCESS:
    case ActionTypes.CLIENT_STOP_TORRENT_SUCCESS:
    case ActionTypes.CLIENT_CHECK_HASH_SUCCESS:
      TorrentStore.fetchTorrents();
      break;
  }
});

export default TorrentStore;
