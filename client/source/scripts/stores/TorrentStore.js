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
    TorrentActions.fetchTorrentDetails(UIStore.getTorrentDetailsHash());

    if (this.pollTorrentDetailsIntervalID === null) {
      this.startPollingTorrentDetails();
    }
  }

  fetchTorrents() {
    TorrentActions.fetchTorrents();

    if (this.pollTorrentsIntervalID === null) {
      this.startPollingTorrents();
    }
  }

  getTorrentDetails(hash) {
    return this.torrents[hash].details || {};
  }

  setTorrentDetails(hash, torrentDetails) {
    this.torrents[hash].details = torrentDetails;
    this.emit(EventTypes.CLIENT_TORRENT_DETAILS_CHANGE);
  }

  getSelectedTorrents() {
    return this.selectedTorrents;
  }

  handleAddTorrentError(error) {
    this.emit(EventTypes.CLIENT_ADD_TORRENT_ERROR);
  }

  handleAddTorrentSuccess(data) {
    this.emit(EventTypes.CLIENT_ADD_TORRENT_SUCCESS);
  }

  setSelectedTorrents(event, hash) {
    this.selectedTorrents = selectTorrents({
      event,
      hash,
      selectedTorrents: this.selectedTorrents,
      torrentList: this.sortedTorrents
    });
    this.emit(EventTypes.UI_TORRENT_SELECTION_CHANGE);
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

  setTorrents(torrents) {
    let torrentsSort = TorrentFilterStore.getTorrentsSort();

    this.torrents = torrents;

    // Convert torrents hash to array and sort it.
    this.sortedTorrents = sortTorrents(this.torrents,
      {direction: torrentsSort.direction, property: torrentsSort.value});

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

    this.emit(EventTypes.CLIENT_TORRENTS_REQUEST_SUCCESS);
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
    this.setTorrents(this.torrents);
  }
}

const TorrentStore = new TorrentStoreClass();

AppDispatcher.register((payload) => {
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
      TorrentStore.setTorrents(action.data.torrents);
      break;
    case ActionTypes.CLIENT_FETCH_TORRENTS_ERROR:
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
