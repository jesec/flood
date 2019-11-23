import diffActionTypes from '@shared/constants/diffActionTypes';

import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';
import SettingsStore from './SettingsStore';
// TODO: Fix this circular dependency
// eslint-disable-next-line
import TorrentStore from './TorrentStore';

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
    this.emit(EventTypes.UI_TORRENTS_FILTER_CLEAR);
    this.emit(EventTypes.UI_TORRENTS_FILTER_SEARCH_CHANGE);
    this.emit(EventTypes.UI_TORRENTS_FILTER_STATUS_CHANGE);
    this.emit(EventTypes.UI_TORRENTS_FILTER_TRACKER_CHANGE);
    this.emit(EventTypes.UI_TORRENTS_FILTER_TAG_CHANGE);
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
    return this.taxonomy.statusCounts || {};
  }

  getTorrentTagCount() {
    return this.taxonomy.tagCounts || {};
  }

  getTorrentTrackerCount() {
    return this.taxonomy.trackerCounts || {};
  }

  handleFetchSettingsRequest() {
    this.setTorrentsSort(SettingsStore.getFloodSettings('sortTorrents'));
  }

  handleTorrentTaxonomyDiffChange(diff) {
    Object.keys(diff).forEach(taxonomyKey => {
      const changes = diff[taxonomyKey];

      changes.forEach(change => {
        if (change.action === diffActionTypes.ITEM_REMOVED) {
          delete this.taxonomy[taxonomyKey][change.data];
        } else {
          this.taxonomy[taxonomyKey] = {
            ...this.taxonomy[taxonomyKey],
            ...change.data,
          };
        }
      });
    });

    // TODO: This logic is duplicated. Also update it to check for changed
    // trackers.
    if (this.tagFilter !== 'all' && !Object.keys(this.taxonomy.tagCounts).includes(this.tagFilter)) {
      this.setTagFilter('all');
    }

    this.emit(EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS);
  }

  handleTorrentTaxonomyFullUpdate(taxonomy) {
    this.taxonomy = taxonomy;

    // TODO: This logic is duplicated. Also update it to check for changed
    // trackers.
    if (this.tagFilter !== 'all' && !Object.keys(taxonomy.tags).includes(this.tagFilter)) {
      this.setTagFilter('all');
    }

    this.emit(EventTypes.CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS);
  }

  isFilterActive() {
    return (
      this.getStatusFilter() !== 'all' ||
      this.getSearchFilter() !== '' ||
      this.getTagFilter() !== 'all' ||
      this.getTrackerFilter() !== 'all'
    );
  }

  setSearchFilter(filter) {
    this.searchFilter = filter;
    this.emit(EventTypes.UI_TORRENTS_FILTER_CHANGE);
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

const TorrentFilterStore = new TorrentFilterStoreClass();

TorrentFilterStore.dispatcherID = AppDispatcher.register(payload => {
  const {action} = payload;

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
    case ActionTypes.TAXONOMY_FULL_UPDATE:
      TorrentFilterStore.handleTorrentTaxonomyFullUpdate(action.data);
      break;
    case ActionTypes.TAXONOMY_DIFF_CHANGE:
      TorrentFilterStore.handleTorrentTaxonomyDiffChange(action.data);
      break;
    case ActionTypes.SETTINGS_FETCH_REQUEST_SUCCESS:
      AppDispatcher.waitFor([SettingsStore.dispatcherID]);
      TorrentFilterStore.handleFetchSettingsRequest();
      break;
    default:
      break;
  }
});

export default TorrentFilterStore;
