import {computed, makeAutoObservable} from 'mobx';
import jsonpatch, {Operation} from 'fast-json-patch';

import type {Taxonomy} from '@shared/types/Taxonomy';
import type {TorrentStatus} from '@shared/constants/torrentStatusMap';

class TorrentFilterStore {
  filters: {
    searchFilter: string;
    statusFilter: TorrentStatus | '';
    tagFilter: string;
    trackerFilter: string;
  } = {
    searchFilter: '',
    statusFilter: '',
    tagFilter: '',
    trackerFilter: '',
  };

  taxonomy: Taxonomy = {
    statusCounts: {},
    tagCounts: {},
    trackerCounts: {},
  };

  @computed get isFilterActive() {
    return (
      this.filters.searchFilter !== '' ||
      this.filters.statusFilter !== '' ||
      this.filters.tagFilter !== '' ||
      this.filters.trackerFilter !== ''
    );
  }

  constructor() {
    makeAutoObservable(this);
  }

  clearAllFilters() {
    this.filters = {
      searchFilter: '',
      statusFilter: '',
      tagFilter: '',
      trackerFilter: '',
    };
  }

  handleTorrentTaxonomyDiffChange(diff: Operation[]) {
    jsonpatch.applyPatch(this.taxonomy, diff);
  }

  handleTorrentTaxonomyFullUpdate(taxonomy: Taxonomy) {
    this.taxonomy = taxonomy;
  }

  setSearchFilter(filter: string) {
    this.filters = {
      ...this.filters,
      searchFilter: filter,
    };
  }

  setStatusFilter(filter: TorrentStatus) {
    this.filters = {
      ...this.filters,
      statusFilter: filter,
    };
  }

  setTagFilter(filter: string) {
    this.filters = {
      ...this.filters,
      tagFilter: filter,
    };
  }

  setTrackerFilter(filter: string) {
    this.filters = {
      ...this.filters,
      trackerFilter: filter,
    };
  }
}

export default new TorrentFilterStore();
