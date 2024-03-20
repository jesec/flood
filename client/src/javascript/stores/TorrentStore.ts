import {applyPatch, Operation} from 'fast-json-patch';
import {computed, makeAutoObservable} from 'mobx';

import filterTorrents from '@client/util/filterTorrents';
import selectTorrents from '@client/util/selectTorrents';
import sortTorrents from '@client/util/sortTorrents';
import termMatch from '@client/util/termMatch';

import type {TorrentProperties, TorrentList} from '@shared/types/Torrent';

import SettingStore from './SettingStore';
import TorrentFilterStore from './TorrentFilterStore';

class TorrentStore {
  selectedTorrents: Array<string> = [];
  torrents: TorrentList = {};

  constructor() {
    makeAutoObservable(this);
  }

  @computed get sortedTorrents(): Array<TorrentProperties> {
    return sortTorrents(Object.values(this.torrents), SettingStore.floodSettings.sortTorrents);
  }

  @computed get filteredTorrents(): Array<TorrentProperties> {
    const {locationFilter, searchFilter, statusFilter, tagFilter, trackerFilter} = TorrentFilterStore;

    let filteredTorrents = Object.assign([], this.sortedTorrents) as Array<TorrentProperties>;

    if (locationFilter.length) {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'location',
        filter: locationFilter,
      });
    }

    if (searchFilter !== '') {
      filteredTorrents = termMatch(filteredTorrents, (properties) => properties.name, searchFilter);
    }

    if (statusFilter.length) {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'status',
        filter: statusFilter,
      });
    }

    if (tagFilter.length) {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'tag',
        filter: tagFilter,
      });
    }

    if (trackerFilter.length) {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'tracker',
        filter: trackerFilter,
      });
    }

    return filteredTorrents;
  }

  setSelectedTorrents({event, hash}: {event: React.KeyboardEvent | React.MouseEvent | React.TouchEvent; hash: string}) {
    this.selectedTorrents = selectTorrents({
      event,
      hash,
      selectedTorrents: this.selectedTorrents,
      torrentList: this.filteredTorrents,
    });
  }

  selectAllTorrents() {
    this.selectedTorrents = this.filteredTorrents.map((v) => v.hash);
  }

  handleTorrentListDiffChange(torrentListDiffs: Operation[]) {
    applyPatch(this.torrents, torrentListDiffs);
  }

  handleTorrentListFullUpdate(torrentList: TorrentList) {
    this.torrents = torrentList;
  }
}

export default new TorrentStore();
