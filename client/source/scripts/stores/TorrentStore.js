import _ from 'lodash';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import config from '../../../../config';
import EventTypes from '../constants/EventTypes';
import {filterTorrents} from '../util/filterTorrents';
import {searchTorrents} from '../util/searchTorrents';
import {selectTorrents} from '../util/selectTorrents';
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

  fetchTorrentDetails() {
    if (!this.isRequestPending('fetch-torrent-details')) {
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

    if (trackerFilter && trackerFilter !== 'all') {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'tracker',
        filter: trackerFilter
      });
    }

    this.filteredTorrents = filteredTorrents;
  }

  getTorrentDetails(hash) {
    return this.torrents[hash].details || {};
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

  handleAddTorrentError() {
    this.emit(EventTypes.CLIENT_ADD_TORRENT_ERROR);
  }

  handleAddTorrentSuccess() {
    this.emit(EventTypes.CLIENT_ADD_TORRENT_SUCCESS);
  }

  getTorrent(hash) {
    return this.torrents[hash];
  }

  getAllTorrents() {
    return this.torrents;
  }

  getTorrents() {
    if (TorrentFilterStore.isFilterActive()) {
      return this.filteredTorrents;
    }

    return this.sortedTorrents;
  }

  handleMoveTorrentsSuccess(data) {
    this.emit(EventTypes.CLIENT_MOVE_TORRENTS_SUCCESS);
  }

  handleMoveTorrentsError(error) {
    this.emit(EventTypes.CLIENT_MOVE_TORRENTS_REQUEST_ERROR);
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

  handleFetchTorrentsSuccess(torrents) {
    this.sortTorrents(torrents);
    this.filterTorrents();

    this.emit(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS);
    this.resolveRequest('fetch-torrents');
  }

  setTorrentDetails(hash, torrentDetails) {
    this.torrents[hash].details = torrentDetails;
    this.emit(EventTypes.CLIENT_TORRENT_DETAILS_CHANGE);
    this.resolveRequest('fetch-torrent-details');
  }

  sortTorrents(torrents) {
    let torrentsSort = TorrentFilterStore.getTorrentsSort();

    this.torrents = torrents;

    // Convert torrents hash to array and sort it.
    this.sortedTorrents = sortTorrents(this.torrents,
      {direction: torrentsSort.direction, property: torrentsSort.value});
  }

  startPollingTorrentDetails() {
    this.pollTorrentDetailsIntervalID = setInterval(
      this.fetchTorrentDetails.bind(this),
      config.pollInterval
    );
  }

  startPollingTorrents() {
    this.pollTorrentsIntervalID = setInterval(
      this.fetchTorrents.bind(this),
      config.pollInterval
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
      TorrentStore.handleAddTorrentSuccess(action.data);
      break;
    case ActionTypes.CLIENT_FETCH_TORRENTS_SUCCESS:
      TorrentStore.handleFetchTorrentsSuccess(action.data.torrents);
      break;
    case ActionTypes.CLIENT_MOVE_TORRENTS_SUCCESS:
      TorrentStore.handleMoveTorrentsSuccess(action.data);
      break;
    case ActionTypes.CLIENT_MOVE_TORRENTS_ERROR:
      TorrentStore.handleMoveTorrentsError(action.error);
      break;
    case ActionTypes.CLIENT_FETCH_TORRENTS_ERROR:
      TorrentStore.handleFetchTorrentsError();
      console.log(action);
      break;
    case ActionTypes.UI_CLICK_TORRENT:
      TorrentStore.setSelectedTorrents(action.data.event, action.data.hash);
      break;
    case ActionTypes.UI_SET_TORRENT_STATUS_FILTER:
    case ActionTypes.UI_SET_TORRENT_TRACKER_FILTER:
    case ActionTypes.UI_SET_TORRENT_SEARCH_FILTER:
    case ActionTypes.UI_SET_TORRENT_SORT:
      TorrentStore.triggerTorrentsFilter();
      break;
    case ActionTypes.CLIENT_ADD_TORRENT_SUCCESS:
    case ActionTypes.CLIENT_START_TORRENT_SUCCESS:
    case ActionTypes.CLIENT_STOP_TORRENT_SUCCESS:
      TorrentStore.fetchTorrents();
      break;
  }
});

export default TorrentStore;
