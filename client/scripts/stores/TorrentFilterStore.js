import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';
import SettingsStore from './SettingsStore';
import TorrentActions from '../actions/TorrentActions';
import TorrentStore from './TorrentStore';
import UIActions from '../actions/UIActions';

class TorrentFilterStoreClass extends BaseStore {
  constructor() {
    super();

    this.searchFilter = '';
    this.statusFilter = 'all';
    this.taxonomy = {};
    this.tagFilter = 'all';
    this.trackerFilter = 'all';
    this.sortTorrentsBy = SettingsStore.getFloodSettings('sortTorrents');
  }

  clearAllFilters() {
    this.searchFilter = '';
    this.statusFilter = 'all';
    this.tagFilter = 'all';
    this.trackerFilter = 'all';
    TorrentStore.triggerTorrentsFilter();
    this.emit(EventTypes.UI_TORRENTS_FILTER_SEARCH_CHANGE);
    this.emit(EventTypes.UI_TORRENTS_FILTER_STATUS_CHANGE);
    this.emit(EventTypes.UI_TORRENTS_FILTER_TRACKER_CHANGE);
    this.emit(EventTypes.UI_TORRENTS_FILTER_TAG_CHANGE);
  }

  fetchTorrentTaxonomy() {
    TorrentActions.fetchTorrentTaxonomy();
  }

  getSearchFilter() {
    return this.searchFilter;
  }

  getStatusFilter() {
    return this.statusFilter;
  }

  getTagFilter() {
    return this.tagFilter;
  }

  getTrackerFilter() {
    return this.trackerFilter;
  }

  getTorrentsSort() {
    return this.sortTorrentsBy;
  }

  getTorrentStatusCount() {
    return this.taxonomy.status;
  }

  getTorrentTagCount() {
    return this.taxonomy.tags;
  }

  getTorrentTrackerCount() {
    return this.taxonomy.trackers;
  }

  handleFetchSettingsRequest() {
    this.setTorrentsSort(SettingsStore.getFloodSettings('sortTorrents'));
  }

<<<<<<< af641a4105b973271133bfe56437785e32a37b5a
  handleTorrentTrackerCountRequestError(error) {
    this.emit(EventTypes.CLIENT_TORRENT_TRACKER_COUNT_REQUEST_ERROR);
=======
  handleSetTaxonomySuccess(data) {
    TorrentStore.fetchTorrents();
    this.fetchTorrentTaxonomy();
  }

  handleSortPropsRequestSuccess(sortBy) {
    this.setTorrentsSort(sortBy);
>>>>>>> Add taxonomy related methods, simplify others
  }

  handleTorrentStatusCountRequestError(error) {
    this.emit(EventTypes.CLIENT_TORRENT_STATUS_COUNT_REQUEST_ERROR);
  }

  handleTorrentTaxonomyRequestSuccess(taxonomy) {
    this.taxonomy = taxonomy;

    if (this.tagFilter !== 'all' && !Object.keys(taxonomy.tags).includes(this.tagFilter)) {
      this.setTagFilter('all');
    }

    this.emit(EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS);
  }

  handleTorrentTaxonomyRequestError(error) {
    this.emit(EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_ERROR);
  }

  isFilterActive() {
    return this.getStatusFilter() !== 'all' || this.getSearchFilter() !== ''
      || this.getTagFilter() !== 'all' || this.getTrackerFilter() !== 'all';
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

  setTagFilter(filter) {
    this.tagFilter = filter;
    this.emit(EventTypes.UI_TORRENTS_FILTER_CHANGE);
    this.emit(EventTypes.UI_TORRENTS_FILTER_TAG_CHANGE);
  }

  setTrackerFilter(filter) {
    this.trackerFilter = filter;
    this.emit(EventTypes.UI_TORRENTS_FILTER_CHANGE);
    this.emit(EventTypes.UI_TORRENTS_FILTER_TRACKER_CHANGE);
  }

  setTorrentsSort(sortBy) {
    this.sortTorrentsBy = sortBy;
    TorrentStore.triggerTorrentsSort();
    this.emit(EventTypes.UI_TORRENTS_SORT_CHANGE);
  }

  setTorrentStatusCount(statusCount) {
    this.torrentStatusCount = statusCount;
    this.emit(EventTypes.CLIENT_TORRENT_STATUS_COUNT_CHANGE);
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
    case ActionTypes.UI_SET_TORRENT_TAG_FILTER:
      TorrentFilterStore.setTagFilter(action.data);
      break;
    case ActionTypes.UI_SET_TORRENT_TRACKER_FILTER:
      TorrentFilterStore.setTrackerFilter(action.data);
      break;
    case ActionTypes.UI_SET_TORRENT_SORT:
      TorrentFilterStore.setTorrentsSort(action.data);
      break;
    case ActionTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS:
      TorrentFilterStore.handleTorrentTaxonomyRequestSuccess(action.data);
      break;
    case ActionTypes.CLIENT_FETCH_TORRENT_TAXONOMY_ERROR:
      TorrentFilterStore.handleTorrentTaxonomyRequestError(action.error);
      break;
    case ActionTypes.CLIENT_SET_TAXONOMY_SUCCESS:
      TorrentFilterStore.handleSetTaxonomySuccess(action.data);
      break;
    case ActionTypes.SETTINGS_FETCH_REQUEST_SUCCESS:
      AppDispatcher.waitFor([SettingsStore.dispatcherID]);
      TorrentFilterStore.handleFetchSettingsRequest();
      break;
  }
});

export default TorrentFilterStore;
