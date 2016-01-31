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

  getSearchFilter() {
    return this.searchFilter;
  }

  getStatusFilter() {
    return this.statusFilter;
  }

  getTorrentsSort() {
    return this.sortTorrentsBy;
  }

  handleSortPropsRequestSuccess(sortBy) {
    this.setTorrentsSort(sortBy);
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
  }
});

export default TorrentFilterStore;
