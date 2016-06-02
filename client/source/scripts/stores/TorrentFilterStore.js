import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';
import SettingsStore from './SettingsStore';
import TorrentActions from '../actions/TorrentActions';
import UIActions from '../actions/UIActions';

class TorrentFilterStoreClass extends BaseStore {
  constructor() {
    super();

    this.searchFilter = null;
    this.statusFilter = 'all';
    this.trackerFilter = 'all';
    this.sortTorrentsBy = SettingsStore.getSettings('sortTorrents');
  }

  fetchTorrentStatusCount() {
    TorrentActions.fetchTorrentStatusCount();
  }

  fetchTorrentTrackerCount() {
    TorrentActions.fetchTorrentTrackerCount();
  }

  getSearchFilter() {
    return this.searchFilter;
  }

  getStatusFilter() {
    return this.statusFilter;
  }

  getTrackerFilter() {
    return this.trackerFilter;
  }

  getTorrentsSort() {
    return this.sortTorrentsBy;
  }

  getTorrentStatusCount() {
    return this.torrentStatusCount;
  }

  getTorrentTrackerCount() {
    return this.torrentTrackerCount;
  }

  handleSortPropsRequestSuccess(sortBy) {
    this.setTorrentsSort(sortBy);
  }

  handleTorrentTrackerCountRequestError(error) {
    this.emit(EventTypes.CLIENT_TORRENT_TRACKER_COUNT_REQUEST_ERROR);
  }

  handleTorrentStatusCountRequestError(error) {
    this.emit(EventTypes.CLIENT_TORRENT_STATUS_COUNT_REQUEST_ERROR);
  }

  isFilterActive() {
    return this.getStatusFilter() || this.getSearchFilter()
      || this.getTrackerFilter();
  }

  setSearchFilter(filter) {
    this.searchFilter = filter;
    this.emit(EventTypes.UI_TORRENTS_FILTER_SEARCH_CHANGE);
  }

  setStatusFilter(filter) {
    this.statusFilter = filter;
    this.emit(EventTypes.UI_TORRENTS_FILTER_CHANGE);
    this.emit(EventTypes.UI_TORRENTS_FILTER_STATUS_CHANGE);
  }

  setTrackerFilter(filter) {
    this.trackerFilter = filter;
    this.emit(EventTypes.UI_TORRENTS_FILTER_CHANGE);
    this.emit(EventTypes.UI_TORRENTS_FILTER_TRACKER_CHANGE);
  }

  setTorrentsSort(sortBy) {
    this.sortTorrentsBy = sortBy;
    this.emit(EventTypes.UI_TORRENTS_SORT_CHANGE);
  }

  setTorrentStatusCount(statusCount) {
    this.torrentStatusCount = statusCount;
    this.emit(EventTypes.CLIENT_TORRENT_STATUS_COUNT_CHANGE);
  }

  setTorrentTrackerCount(statusCount) {
    this.torrentTrackerCount = statusCount;
    this.emit(EventTypes.CLIENT_TORRENT_TRACKER_COUNT_CHANGE);
  }
}

let TorrentFilterStore = new TorrentFilterStoreClass();

TorrentFilterStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action, source} = payload;

  switch (action.type) {
    case ActionTypes.UI_SET_TORRENT_SEARCH_FILTER:
      TorrentFilterStore.setSearchFilter(action.data);
      break;
    case ActionTypes.UI_SET_TORRENT_STATUS_FILTER:
      TorrentFilterStore.setStatusFilter(action.data);
      break;
    case ActionTypes.UI_SET_TORRENT_TRACKER_FILTER:
      TorrentFilterStore.setTrackerFilter(action.data);
      break;
    case ActionTypes.UI_SET_TORRENT_SORT:
      TorrentFilterStore.setTorrentsSort(action.data);
      break;
    case ActionTypes.UI_SORT_PROPS_REQUEST_SUCCESS:
      TorrentFilterStore.handleSortPropsRequestSuccess(action.data);
      break;
    case ActionTypes.CLIENT_FETCH_TORRENT_STATUS_COUNT_REQUEST_SUCCESS:
      TorrentFilterStore.setTorrentStatusCount(action.data);
      break;
    case ActionTypes.CLIENT_FETCH_TORRENT_STATUS_COUNT_REQUEST_ERROR:
      TorrentFilterStore.handleTorrentStatusCountRequestError(action.error);
      break;
    case ActionTypes.CLIENT_FETCH_TORRENT_TRACKER_COUNT_REQUEST_SUCCESS:
      TorrentFilterStore.setTorrentTrackerCount(action.data);
      break;
    case ActionTypes.CLIENT_FETCH_TORRENT_TRACKER_COUNT_REQUEST_ERROR:
      TorrentFilterStore.handleTorrentTrackerCountRequestError(action.error);
      break;
  }
});

export default TorrentFilterStore;
