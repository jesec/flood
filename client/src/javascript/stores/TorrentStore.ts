import {applyPatch, Operation} from 'fast-json-patch';
import {computed, makeAutoObservable} from 'mobx';

import type {TorrentProperties, TorrentList} from '@shared/types/Torrent';

import filterTorrents from '../util/filterTorrents';
import searchTorrents from '../util/searchTorrents';
import selectTorrents from '../util/selectTorrents';
import SettingStore from './SettingStore';
import sortTorrents from '../util/sortTorrents';
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
    const {searchFilter, statusFilter, tagFilter, trackerFilter} = TorrentFilterStore.filters;

    let filteredTorrents = Object.assign([], this.sortedTorrents) as Array<TorrentProperties>;

    if (searchFilter !== '') {
      filteredTorrents = searchTorrents(filteredTorrents, searchFilter);
    }

    if (statusFilter !== '') {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'status',
        filter: statusFilter,
      });
    }

    if (tagFilter !== '') {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'tag',
        filter: tagFilter,
      });
    }

    if (trackerFilter !== '') {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'tracker',
        filter: trackerFilter,
      });
    }

    return filteredTorrents;
  }

  setSelectedTorrents({event, hash}: {event: React.MouseEvent | React.TouchEvent; hash: string}) {
    this.selectedTorrents = selectTorrents({
      event,
      hash,
      selectedTorrents: this.selectedTorrents,
      torrentList: this.filteredTorrents,
    });
  }

  handleTorrentListDiffChange(torrentListDiffs: Operation[]) {
    applyPatch(this.torrents, torrentListDiffs);
  }

  handleTorrentListFullUpdate(torrentList: TorrentList) {
    this.torrents = torrentList;
  }
}

export default new TorrentStore();
