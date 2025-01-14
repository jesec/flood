import {computed, makeAutoObservable} from 'mobx';
import jsonpatch, {Operation} from 'fast-json-patch';
import {KeyboardEvent, MouseEvent, TouchEvent} from 'react';

import type {Taxonomy} from '@shared/types/Taxonomy';
import torrentStatusMap, {TorrentStatus} from '@shared/constants/torrentStatusMap';

class TorrentFilterStore {
  locationFilter: Array<string> = [];
  searchFilter = '';
  statusFilter: Array<TorrentStatus> = [];
  tagFilter: Array<string> = [];
  trackerFilter: Array<string> = [];

  filterTrigger = false;

  taxonomy: Taxonomy = {
    locationTree: {directoryName: '', fullPath: '', children: [], containedCount: 0, containedSize: 0},
    statusCounts: {},
    tagCounts: {},
    tagSizes: {},
    trackerCounts: {},
    trackerSizes: {},
  };

  @computed get isFilterActive() {
    return (
      this.locationFilter.length ||
      this.searchFilter !== '' ||
      this.statusFilter.length ||
      this.tagFilter.length ||
      this.trackerFilter.length
    );
  }

  constructor() {
    makeAutoObservable(this);
  }

  clearAllFilters() {
    this.locationFilter = [];
    this.searchFilter = '';
    this.statusFilter = [];
    this.tagFilter = [];
    this.trackerFilter = [];
    this.filterTrigger = !this.filterTrigger;
  }

  handleTorrentTaxonomyDiffChange(diff: Operation[]) {
    jsonpatch.applyPatch(this.taxonomy, diff);
  }

  handleTorrentTaxonomyFullUpdate(taxonomy: Taxonomy) {
    this.taxonomy = taxonomy;
  }

  setSearchFilter(filter: string) {
    this.searchFilter = filter;
    this.filterTrigger = !this.filterTrigger;
  }

  setLocationFilters(filter: string | '', event: KeyboardEvent | MouseEvent | TouchEvent) {
    // keys: [] to disable shift-clicking as it doesn't make sense in a tree
    this.computeFilters([], this.locationFilter, filter, event);
    this.filterTrigger = !this.filterTrigger;
  }

  setStatusFilters(filter: TorrentStatus | '', event: KeyboardEvent | MouseEvent | TouchEvent) {
    this.computeFilters(torrentStatusMap, this.statusFilter, filter, event);
    this.filterTrigger = !this.filterTrigger;
  }

  setTagFilters(filter: string, event: KeyboardEvent | MouseEvent | TouchEvent) {
    const tags = Object.keys(this.taxonomy.tagCounts).sort((a, b) => {
      if (a === 'untagged') return -1;
      else if (b === 'untagged') return 1;
      else return a.localeCompare(b);
    });

    // Put 'untagged' in the correct second position for shift click ordering
    tags.splice(tags.indexOf('untagged'), 1);
    tags.splice(1, 0, 'untagged');

    this.computeFilters(tags, this.tagFilter, filter, event);
    this.filterTrigger = !this.filterTrigger;
  }

  setTrackerFilters(filter: string, event: KeyboardEvent | MouseEvent | TouchEvent) {
    const trackers = Object.keys(this.taxonomy.trackerCounts).sort((a, b) => a.localeCompare(b));

    this.computeFilters(trackers, this.trackerFilter, filter, event);
    this.filterTrigger = !this.filterTrigger;
  }

  private computeFilters<T extends TorrentStatus | string>(
    keys: readonly T[],
    currentFilters: Array<T>,
    newFilter: T,
    event: KeyboardEvent | MouseEvent | TouchEvent,
  ) {
    if (newFilter === ('' as T)) {
      currentFilters.splice(0);
    } else if (event.shiftKey && keys.length) {
      if (currentFilters.length) {
        const lastKey = currentFilters[currentFilters.length - 1];
        const lastKeyIndex = keys.indexOf(lastKey);
        let currentKeyIndex = keys.indexOf(newFilter);

        if (!~currentKeyIndex || !~lastKeyIndex) {
          return;
        }

        // from the previously selected index to the currently selected index,
        // add all filters to the selected array.
        // if the newly selected index is larger than the previous, start from
        // the newly selected index and work backwards. otherwise go forwards.
        const increment = currentKeyIndex > lastKeyIndex ? -1 : 1;

        for (; currentKeyIndex !== lastKeyIndex; currentKeyIndex += increment) {
          const foundKey = keys[currentKeyIndex] as T;
          // if the filter isn't already selected, add the filter to the array.
          if (!currentFilters.includes(foundKey)) {
            currentFilters.push(foundKey);
          }
        }
      } else {
        currentFilters.splice(0, currentFilters.length, newFilter);
      }
    } else if (event.metaKey || event.ctrlKey) {
      if (currentFilters.includes(newFilter)) {
        currentFilters.splice(currentFilters.indexOf(newFilter), 1);
      } else {
        currentFilters.push(newFilter);
      }
    } else {
      currentFilters.splice(0, currentFilters.length, newFilter);
    }
  }
}

export default new TorrentFilterStore();
