import serverEventTypes from 'universally-shared-code/constants/serverEventTypes';

import ActionTypes from '../constants/ActionTypes';
import AlertStore from './AlertStore';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import ConfigStore from './ConfigStore';
import EventTypes from '../constants/EventTypes';
import {filterTorrents} from '../util/filterTorrents';
import FloodActions from '../actions/FloodActions';
import {searchTorrents} from '../util/searchTorrents';
import {selectTorrents} from '../util/selectTorrents';
import SettingsStore from './SettingsStore';
import {sortTorrents} from '../util/sortTorrents';
import TorrentActions from '../actions/TorrentActions';
import TorrentFilterStore from './TorrentFilterStore';
import UIStore from './UIStore';

const pollInterval = ConfigStore.getPollInterval();

class TorrentStoreClass extends BaseStore {
  constructor() {
    super();

    this.filteredTorrents = {};
    this.mediainfo = {};
    this.pollTorrentDetailsIntervalID = null;
    this.selectedTorrents = [];
    this.sortedTorrents = [];
    this.torrents = {};
  }

  fetchMediainfo(hash) {
    FloodActions.fetchMediainfo({hash});
  }

  fetchTorrentDetails(options = {}) {
    if (!this.isRequestPending('fetch-torrent-details') || options.forceUpdate) {
      this.beginRequest('fetch-torrent-details');
      TorrentActions.fetchTorrentDetails(UIStore.getTorrentDetailsHash());
    }

    if (this.pollTorrentDetailsIntervalID === null) {
      this.startPollingTorrentDetails();
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
        filter: statusFilter,
      });
    }

    if (tagFilter && tagFilter !== 'all') {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'tag',
        filter: tagFilter,
      });
    }

    if (trackerFilter && trackerFilter !== 'all') {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'tracker',
        filter: trackerFilter,
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
    return this.selectedTorrents.map(hash => {
      return this.torrents[hash].basePath;
    });
  }

  getSelectedTorrentsFilename() {
    return this.selectedTorrents.map(hash => {
      return this.torrents[hash].baseFilename;
    });
  }

  getSelectedTorrentsTags() {
    return this.selectedTorrents.map(hash => {
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
      data: response.destination,
    });

    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.add',
        value: response.count || 1,
      },
      id: 'alert.torrent.add',
    });
  }

  handleFetchMediainfoError(error) {
    this.emit(EventTypes.FLOOD_FETCH_MEDIAINFO_ERROR, error);
  }

  handleFetchMediainfoSuccess(response) {
    this.mediainfo[response.hash] = response.output;
    this.emit(EventTypes.FLOOD_FETCH_MEDIAINFO_SUCCESS);
  }

  getTorrent(hash) {
    return this.torrents[hash];
  }

  getAllTorrents() {
    return this.torrents;
  }

  getMediainfo(hash) {
    return this.mediainfo[hash];
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
        value: response.count,
      },
      id: 'alert.torrent.move',
    });
  }

  handleMoveTorrentsError(error) {
    this.emit(EventTypes.CLIENT_MOVE_TORRENTS_REQUEST_ERROR);

    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.move.failed',
        value: error.count,
      },
      id: 'alert.torrent.move.failed',
    });
  }

  setSelectedTorrents(event, hash) {
    this.selectedTorrents = selectTorrents({
      event,
      hash,
      selectedTorrents: this.selectedTorrents,
      torrentList: this.filteredTorrents,
    });
    this.emit(EventTypes.UI_TORRENT_SELECTION_CHANGE);
  }

  handleRemoveTorrentsSuccess(response) {
    SettingsStore.saveFloodSettings({
      id: 'deleteTorrentData',
      data: response.deleteData,
    });

    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.remove',
        value: response.count,
      },
      id: 'alert.torrent.remove',
    });
  }

  handleRemoveTorrentsError(error) {
    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.remove.failed',
        value: error.count,
      },
      id: 'alert.torrent.remove.failed',
    });
  }

  handleSetFilePrioritySuccess() {
    this.emit(EventTypes.CLIENT_SET_FILE_PRIORITY_SUCCESS);
    this.fetchTorrentDetails({forceUpdate: true});
  }

  handleTorrentListDiffChange(torrentListDiff) {
    Object.keys(torrentListDiff).forEach(torrentHash => {
      const {action, data} = torrentListDiff[torrentHash];

      switch (action) {
        case serverEventTypes.TORRENT_LIST_ACTION_TORRENT_ADDED:
          this.torrents[torrentHash] = data;
          break;
        case serverEventTypes.TORRENT_LIST_ACTION_TORRENT_DELETED:
          if (this.selectedTorrents.includes(torrentHash)) {
            this.selectedTorrents = this.selectedTorrents.filter(hash => hash !== torrentHash);
          }

          delete this.torrents[torrentHash];
          break;
        case serverEventTypes.TORRENT_LIST_ACTION_TORRENT_DETAIL_UPDATED:
          Object.keys(data).forEach(detailKey => {
            this.torrents[torrentHash][detailKey] = data[detailKey];
          });
          break;
        default:
          break;
      }
    });

    this.sortTorrents();
    this.filterTorrents();

    this.emit(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS);
  }

  handleTorrentListFullUpdate(torrentList) {
    this.torrents = torrentList;

    this.sortTorrents();
    this.filterTorrents();

    this.emit(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS);
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
    this.pollTorrentDetailsIntervalID = setInterval(this.fetchTorrentDetails.bind(this), pollInterval);
  }

  stopPollingTorrentDetails() {
    clearInterval(this.pollTorrentDetailsIntervalID);
    this.pollTorrentDetailsIntervalID = null;
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

const TorrentStore = new TorrentStoreClass();

TorrentStore.dispatcherID = AppDispatcher.register(payload => {
  const {action} = payload;

  switch (action.type) {
    case ActionTypes.CLIENT_FETCH_TORRENT_DETAILS_SUCCESS:
      TorrentStore.setTorrentDetails(action.data.hash, action.data.torrentDetails);
      break;
    case ActionTypes.CLIENT_ADD_TORRENT_ERROR:
      TorrentStore.handleAddTorrentError(action.error);
      break;
    case ActionTypes.CLIENT_ADD_TORRENT_SUCCESS:
      TorrentStore.handleAddTorrentSuccess(action.data);
      break;
    case ActionTypes.TORRENT_LIST_DIFF_CHANGE:
      TorrentStore.handleTorrentListDiffChange(action.data);
      break;
    case ActionTypes.TORRENT_LIST_FULL_UPDATE:
      TorrentStore.handleTorrentListFullUpdate(action.data);
      break;
    case ActionTypes.CLIENT_MOVE_TORRENTS_SUCCESS:
      TorrentStore.handleMoveTorrentsSuccess(action.data);
      break;
    case ActionTypes.CLIENT_MOVE_TORRENTS_ERROR:
      TorrentStore.handleMoveTorrentsError(action.error);
      break;
    case ActionTypes.CLIENT_REMOVE_TORRENT_SUCCESS:
      TorrentStore.handleRemoveTorrentsSuccess(action.data);
      break;
    case ActionTypes.CLIENT_REMOVE_TORRENT_ERROR:
      TorrentStore.handleRemoveTorrentsError(action.error);
      break;
    case ActionTypes.CLIENT_SET_FILE_PRIORITY_SUCCESS:
      TorrentStore.handleSetFilePrioritySuccess(action.data);
      break;
    case ActionTypes.FLOOD_FETCH_MEDIAINFO_SUCCESS:
      TorrentStore.handleFetchMediainfoSuccess(action.data);
      break;
    case ActionTypes.FLOOD_FETCH_MEDIAINFO_ERROR:
      TorrentStore.handleFetchMediainfoError(action.error);
      break;
    case ActionTypes.UI_CLICK_TORRENT:
      TorrentStore.setSelectedTorrents(action.data.event, action.data.hash);
      break;
    case ActionTypes.UI_SET_TORRENT_SORT:
      TorrentStore.triggerTorrentsSort();
      break;
    case ActionTypes.UI_SET_TORRENT_SEARCH_FILTER:
    case ActionTypes.UI_SET_TORRENT_STATUS_FILTER:
    case ActionTypes.UI_SET_TORRENT_TAG_FILTER:
    case ActionTypes.UI_SET_TORRENT_TRACKER_FILTER:
      TorrentStore.triggerTorrentsFilter();
      break;
    default:
      break;
  }
});

export default TorrentStore;
