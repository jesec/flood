import type {Taxonomy, TaxonomyDiffs} from '@shared/types/Taxonomy';
import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';

class TorrentFilterStoreClass extends BaseStore {
  searchFilter = '';
  statusFilter: TorrentStatus | 'all' = 'all';
  tagFilter = 'all';
  trackerFilter = 'all';

  taxonomy: Taxonomy = {
    statusCounts: {},
    tagCounts: {},
    trackerCounts: {},
  };

  clearAllFilters() {
    this.searchFilter = '';
    this.statusFilter = 'all';
    this.tagFilter = 'all';
    this.trackerFilter = 'all';
    this.emit('UI_TORRENTS_FILTER_CLEAR');
    this.emit('UI_TORRENTS_FILTER_SEARCH_CHANGE');
    this.emit('UI_TORRENTS_FILTER_STATUS_CHANGE');
    this.emit('UI_TORRENTS_FILTER_TRACKER_CHANGE');
    this.emit('UI_TORRENTS_FILTER_TAG_CHANGE');
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

  getTorrentStatusCount() {
    return this.taxonomy.statusCounts;
  }

  getTorrentTagCount() {
    return this.taxonomy.tagCounts;
  }

  getTorrentTrackerCount() {
    return this.taxonomy.trackerCounts;
  }

  handleTorrentTaxonomyDiffChange(diff: TaxonomyDiffs) {
    Object.entries(diff).forEach(([key, value]) => {
      const taxonomyKey = key as keyof TaxonomyDiffs;
      const changes = value as TaxonomyDiffs[keyof TaxonomyDiffs];

      if (changes == null) {
        return;
      }

      changes.forEach((change) => {
        if (change.action === 'ITEM_REMOVED') {
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

    this.emit('CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS');
  }

  handleTorrentTaxonomyFullUpdate(taxonomy: Taxonomy) {
    this.taxonomy = taxonomy;

    // TODO: This logic is duplicated. Also update it to check for changed
    // trackers.
    if (this.tagFilter !== 'all' && !Object.keys(taxonomy.tagCounts).includes(this.tagFilter)) {
      this.setTagFilter('all');
    }

    this.emit('CLIENT_FETCH_TORRENT_TAXONOMY_SUCCESS');
  }

  isFilterActive() {
    return (
      this.getStatusFilter() !== 'all' ||
      this.getSearchFilter() !== '' ||
      this.getTagFilter() !== 'all' ||
      this.getTrackerFilter() !== 'all'
    );
  }

  setSearchFilter(filter: string) {
    this.searchFilter = filter;
    this.emit('UI_TORRENTS_FILTER_CHANGE');
    this.emit('UI_TORRENTS_FILTER_SEARCH_CHANGE');
  }

  setStatusFilter(filter: TorrentStatus) {
    this.statusFilter = filter;
    this.emit('UI_TORRENTS_FILTER_CHANGE');
    this.emit('UI_TORRENTS_FILTER_STATUS_CHANGE');
  }

  setTagFilter(filter: string) {
    this.tagFilter = filter;
    this.emit('UI_TORRENTS_FILTER_CHANGE');
    this.emit('UI_TORRENTS_FILTER_TAG_CHANGE');
  }

  setTrackerFilter(filter: string) {
    this.trackerFilter = filter;
    this.emit('UI_TORRENTS_FILTER_CHANGE');
    this.emit('UI_TORRENTS_FILTER_TRACKER_CHANGE');
  }
}

const TorrentFilterStore = new TorrentFilterStoreClass();

TorrentFilterStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action} = payload;

  switch (action.type) {
    case 'UI_SET_TORRENT_SEARCH_FILTER':
      TorrentFilterStore.setSearchFilter(action.data);
      break;
    case 'UI_SET_TORRENT_STATUS_FILTER':
      TorrentFilterStore.setStatusFilter(action.data);
      break;
    case 'UI_SET_TORRENT_TAG_FILTER':
      TorrentFilterStore.setTagFilter(action.data);
      break;
    case 'UI_SET_TORRENT_TRACKER_FILTER':
      TorrentFilterStore.setTrackerFilter(action.data);
      break;
    case 'TAXONOMY_FULL_UPDATE':
      TorrentFilterStore.handleTorrentTaxonomyFullUpdate(action.data);
      break;
    case 'TAXONOMY_DIFF_CHANGE':
      TorrentFilterStore.handleTorrentTaxonomyDiffChange(action.data);
      break;
    default:
      break;
  }
});

export default TorrentFilterStore;
