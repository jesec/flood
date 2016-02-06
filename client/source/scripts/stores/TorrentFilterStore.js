import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';
import TorrentActions from '../actions/TorrentActions';
import UIActions from '../actions/UIActions';

class TorrentFilterStoreClass extends BaseStore {
  constructor() {
    super();

    this.searchFilter = null;
    this.statusFilter = 'all';
    this.sortTorrentsBy = {
      direction: 'desc',
      displayName: 'Date Added',
      property: 'sortBy',
      value: 'added'
    };
  }

  fetchSortProps() {
    UIActions.fetchSortProps();
  }

  fetchTorrentStatusCount() {
    TorrentActions.fetchTorrentStatusCount();
  }

  getSearchFilter() {
    return this.searchFilter;
  }

  getStatusFilter() {
    return this.statusFilter;
  }

  getTorrentsSort() {
    return this.sortTorrentsBy;
  }

  getTorrentStatusCount() {
    return this.torrentStatusCount;
  }

  handleSortPropsRequestSuccess(sortBy) {
    this.setTorrentsSort(sortBy);
  }

  handleTorrentStatusCountRequestError() {

  }

  setSearchFilter(filter) {
    this.searchFilter = filter;
    this.emit(EventTypes.UI_TORRENTS_FILTER_SEARCH_CHANGE);
  }

  setStatusFilter(filter) {
    this.statusFilter = filter;
    this.emit(EventTypes.UI_TORRENTS_FILTER_STATUS_CHANGE);
  }

  setTorrentsSort(sortBy) {
    this.sortTorrentsBy = sortBy;
    this.emit(EventTypes.UI_TORRENTS_SORT_CHANGE)
  }

  setTorrentStatusCount(statusCount) {
    this.torrentStatusCount = statusCount;
    this.emit(EventTypes.CLIENT_TORRENT_STATUS_COUNT_CHANGE);
  }
}

const TorrentFilterStore = new TorrentFilterStoreClass();

AppDispatcher.register((payload) => {
  const {action, source} = payload;

  switch (action.type) {
    case ActionTypes.UI_SET_TORRENT_SEARCH_FILTER:
      TorrentFilterStore.setSearchFilter(action.data);
      break;
    case ActionTypes.UI_SET_TORRENT_STATUS_FILTER:
      TorrentFilterStore.setStatusFilter(action.data);
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
      TorrentFilterStore.handleTorrentStatusCountRequestError(action.data);
      break;
  }
});

export default TorrentFilterStore;
