import _ from 'lodash';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import config from '../config/config';
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

    this.filteredTorrents = [];
    this.pollTorrentDetailsIntervalID = null;
    this.pollTorrentsIntervalID = null;
    this.selectedTorrents = [];
    this.torrentDetails = {};
    this.torrents = [];
  }

  fetchTorrentDetails() {
    TorrentActions.fetchTorrentDetails(UIStore.getTorrentDetailsHash());
    if (this.pollTorrentDetailsIntervalID === null) {
      this.stopPollingTorrentDetails();
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
    return this.torrentDetails[hash] || {};
  }

  setTorrentDetails(hash, torrentDetails) {
    this.torrentDetails[hash] = torrentDetails;
    this.emit(EventTypes.CLIENT_TORRENT_DETAILS_CHANGE);
  }

  getSelectedTorrents() {
    return this.selectedTorrents;
  }

  setSelectedTorrents(event, hash) {
    this.selectedTorrents = selectTorrents({
      event,
      hash,
      selectedTorrents: this.selectedTorrents,
      torrentList: this.torrents
    });
    this.emit(EventTypes.UI_TORRENT_SELECTION_CHANGE);
  }

  getTorrent(hash) {
    return _.find(this.torrents, (torrent) => {
      return torrent.hash === hash;
    });
  }

  getTorrents() {
    if (TorrentFilterStore.getStatusFilter() ||
      TorrentFilterStore.getSearchFilter()) {
      return this.filteredTorrents;
    }

    return this.torrents;
  }

  setTorrents(torrents) {
    this.torrents = sortTorrents(
      Object.assign([], torrents),
      TorrentFilterStore.getTorrentsSort()
    );

    let statusFilter = TorrentFilterStore.getStatusFilter();
    let searchFilter = TorrentFilterStore.getSearchFilter();

    if (statusFilter || searchFilter) {
      let filteredTorrents = Object.assign([], this.torrents);

      if (statusFilter && statusFilter !== 'all') {
        filteredTorrents = filterTorrents(filteredTorrents, statusFilter);
      }

      if (searchFilter && searchFilter !== '') {
        filteredTorrents = searchTorrents(filteredTorrents, searchFilter);
      }

      this.filteredTorrents = filteredTorrents;
    }

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
