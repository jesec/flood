import type {TorrentDetails, TorrentProperties, TorrentListDiff, Torrents} from '@shared/types/Torrent';

import AlertStore from './AlertStore';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import ConfigStore from './ConfigStore';
import filterTorrents from '../util/filterTorrents';
import searchTorrents from '../util/searchTorrents';
import selectTorrents from '../util/selectTorrents';
import SettingsStore from './SettingsStore';
import sortTorrents from '../util/sortTorrents';
import TorrentActions from '../actions/TorrentActions';
import TorrentFilterStore from './TorrentFilterStore';

import type {FloodSettings} from './SettingsStore';

const pollInterval: number = ConfigStore.getPollInterval();

class TorrentStoreClass extends BaseStore {
  filteredTorrents: Array<TorrentProperties> = [];
  mediainfo: Record<string, string> = {}; // hash: mediainfo output
  pollTorrentDetailsIntervalID: number | null = null;
  selectedTorrents: Array<string> = [];
  sortedTorrents: Array<TorrentProperties> = [];
  sortTorrentsBy: FloodSettings['sortTorrents'] = SettingsStore.getFloodSetting('sortTorrents');
  torrents: Torrents = {};

  fetchTorrentDetails(hash: TorrentProperties['hash'], forceUpdate?: boolean) {
    if (!this.isRequestPending('fetch-torrent-details') || forceUpdate) {
      this.beginRequest('fetch-torrent-details');
      TorrentActions.fetchTorrentDetails(hash);
    }

    if (this.pollTorrentDetailsIntervalID === null) {
      this.startPollingTorrentDetails(hash);
    }
  }

  filterTorrents() {
    const searchFilter = TorrentFilterStore.getSearchFilter();
    const statusFilter = TorrentFilterStore.getStatusFilter();
    const tagFilter = TorrentFilterStore.getTagFilter();
    const trackerFilter = TorrentFilterStore.getTrackerFilter();

    let filteredTorrents = Object.assign([], this.sortedTorrents) as Array<TorrentProperties>;

    if (searchFilter && searchFilter !== '') {
      filteredTorrents = searchTorrents(filteredTorrents, searchFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'status',
        filter: statusFilter,
      });
    }

    if (tagFilter && tagFilter !== 'all') {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'tag',
        filter: tagFilter,
      });
    }

    if (trackerFilter && trackerFilter !== 'all') {
      filteredTorrents = filterTorrents(filteredTorrents, {
        type: 'tracker',
        filter: trackerFilter,
      });
    }

    this.filteredTorrents = filteredTorrents;
  }

  getTorrentDetails(hash: string) {
    return this.torrents[hash].details || null;
  }

  getSelectedTorrents() {
    return this.selectedTorrents;
  }

  getSelectedTorrentsDownloadLocations() {
    return this.selectedTorrents.map((hash: string) => this.torrents[hash].basePath);
  }

  getSelectedTorrentsFilename() {
    return this.selectedTorrents.map((hash: string) => this.torrents[hash].baseFilename);
  }

  getSelectedTorrentsTags() {
    return this.selectedTorrents.map((hash: string) => this.torrents[hash].tags);
  }

  getSelectedTorrentsTrackerURIs() {
    return this.selectedTorrents.map((hash) => this.torrents[hash].trackerURIs);
  }

  handleAddTorrentError() {
    this.emit('CLIENT_ADD_TORRENT_ERROR');
  }

  handleAddTorrentSuccess(response: {count: number; destination: string}) {
    this.emit('CLIENT_ADD_TORRENT_SUCCESS');

    SettingsStore.setFloodSetting('torrentDestination', response.destination);

    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.add',
        value: response.count || 1,
      },
      id: 'alert.torrent.add',
    });
  }

  handleFetchMediainfoSuccess(response: {hash: string; output: string}) {
    this.mediainfo[response.hash] = response.output;
    this.emit('CLIENT_FETCH_TORRENT_MEDIAINFO_SUCCESS');
  }

  handleFetchSettingsRequest() {
    this.triggerTorrentsSort(SettingsStore.getFloodSetting('sortTorrents'));
  }

  getTorrent(hash: string) {
    return this.torrents[hash];
  }

  getAllTorrents() {
    return this.torrents;
  }

  getMediainfo(hash: string) {
    return this.mediainfo[hash];
  }

  getTorrents() {
    // TODO: Audit this filteredTorrents vs sortedTorrents concept.
    if (TorrentFilterStore.isFilterActive()) {
      return this.filteredTorrents;
    }

    return this.sortedTorrents;
  }

  getTorrentsSort() {
    return this.sortTorrentsBy;
  }

  handleMoveTorrentsSuccess(response: {count: number}) {
    this.emit('CLIENT_MOVE_TORRENTS_SUCCESS');

    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.move',
        value: response.count,
      },
      id: 'alert.torrent.move',
    });
  }

  handleMoveTorrentsError(error: {count: number}) {
    this.emit('CLIENT_MOVE_TORRENTS_REQUEST_ERROR');

    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.move.failed',
        value: error.count,
      },
      id: 'alert.torrent.move.failed',
    });
  }

  static handleRemoveTorrentsSuccess(response: {count: number; deleteData: boolean}) {
    SettingsStore.setFloodSetting('deleteTorrentData', response.deleteData);

    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.remove',
        value: response.count,
      },
      id: 'alert.torrent.remove',
    });
  }

  static handleRemoveTorrentsError(error: {count: number}) {
    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.remove.failed',
        value: error.count,
      },
      id: 'alert.torrent.remove.failed',
    });
  }

  setSelectedTorrents({event, hash}: {event: React.MouseEvent<HTMLLIElement>; hash: string}) {
    this.selectedTorrents = selectTorrents({
      event,
      hash,
      selectedTorrents: this.selectedTorrents,
      torrentList: this.filteredTorrents,
    });
    this.emit('UI_TORRENT_SELECTION_CHANGE');
  }

  handleSetFilePrioritySuccess({hash}: {hash: string}) {
    this.emit('CLIENT_SET_FILE_PRIORITY_SUCCESS');
    this.fetchTorrentDetails(hash, true);
  }

  handleTorrentListDiffChange(torrentListDiff: TorrentListDiff) {
    Object.keys(torrentListDiff).forEach((torrentHash) => {
      const diff = torrentListDiff[torrentHash];

      switch (diff.action) {
        case 'TORRENT_LIST_ACTION_TORRENT_ADDED':
          this.torrents[torrentHash] = diff.data;
          break;
        case 'TORRENT_LIST_ACTION_TORRENT_DELETED':
          if (this.selectedTorrents.includes(torrentHash)) {
            this.selectedTorrents = this.selectedTorrents.filter((hash: string) => hash !== torrentHash);
          }

          delete this.torrents[torrentHash];
          break;
        case 'TORRENT_LIST_ACTION_TORRENT_DETAIL_UPDATED':
          if (diff.data == null || this.torrents[torrentHash] == null) {
            break;
          }
          this.torrents[torrentHash] = {
            ...this.torrents[torrentHash],
            ...diff.data,
          };
          break;
        default:
          break;
      }
    });

    this.sortTorrents();
    this.filterTorrents();

    this.emit('CLIENT_TORRENTS_REQUEST_SUCCESS');
  }

  handleTorrentListFullUpdate(torrentList: Torrents) {
    this.torrents = torrentList;

    this.sortTorrents();
    this.filterTorrents();

    this.emit('CLIENT_TORRENTS_REQUEST_SUCCESS');
  }

  handleFetchTorrentDetails({hash, torrentDetails}: {hash: string; torrentDetails: TorrentDetails}) {
    this.torrents[hash].details = torrentDetails;
    this.resolveRequest('fetch-torrent-details');
    this.emit('CLIENT_TORRENT_DETAILS_CHANGE');
  }

  sortTorrents() {
    // Convert torrents hash to array and sort it.
    this.sortedTorrents = sortTorrents(Object.values(this.torrents), this.getTorrentsSort());
  }

  startPollingTorrentDetails(hash: TorrentProperties['hash']) {
    this.pollTorrentDetailsIntervalID = setInterval(this.fetchTorrentDetails.bind(this, hash), pollInterval);
  }

  stopPollingTorrentDetails() {
    if (this.pollTorrentDetailsIntervalID != null) {
      clearInterval(this.pollTorrentDetailsIntervalID);
      this.pollTorrentDetailsIntervalID = null;
    }
  }

  triggerTorrentsFilter() {
    this.filterTorrents();
    this.emit('UI_TORRENTS_LIST_FILTERED');
  }

  triggerTorrentsSort(sortBy: FloodSettings['sortTorrents']) {
    this.sortTorrentsBy = sortBy;
    this.sortTorrents();
    this.triggerTorrentsFilter();
    this.emit('UI_TORRENTS_SORT_CHANGE');
  }
}

const TorrentStore = new TorrentStoreClass();

TorrentStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action} = payload;

  switch (action.type) {
    case 'CLIENT_FETCH_TORRENT_DETAILS_SUCCESS':
      TorrentStore.handleFetchTorrentDetails(action.data);
      break;
    case 'CLIENT_ADD_TORRENT_ERROR':
      TorrentStore.handleAddTorrentError();
      break;
    case 'CLIENT_ADD_TORRENT_SUCCESS':
      TorrentStore.handleAddTorrentSuccess(action.data);
      break;
    case 'TORRENT_LIST_DIFF_CHANGE':
      TorrentStore.handleTorrentListDiffChange(action.data);
      break;
    case 'TORRENT_LIST_FULL_UPDATE':
      TorrentStore.handleTorrentListFullUpdate(action.data);
      break;
    case 'CLIENT_FETCH_TORRENT_MEDIAINFO_SUCCESS':
      TorrentStore.handleFetchMediainfoSuccess(action.data);
      break;
    case 'CLIENT_MOVE_TORRENTS_SUCCESS':
      TorrentStore.handleMoveTorrentsSuccess(action.data);
      break;
    case 'CLIENT_MOVE_TORRENTS_ERROR':
      TorrentStore.handleMoveTorrentsError(action.error);
      break;
    case 'CLIENT_REMOVE_TORRENT_SUCCESS':
      TorrentStoreClass.handleRemoveTorrentsSuccess(action.data);
      break;
    case 'CLIENT_REMOVE_TORRENT_ERROR':
      TorrentStoreClass.handleRemoveTorrentsError(action.error);
      break;
    case 'CLIENT_SET_FILE_PRIORITY_SUCCESS':
      TorrentStore.handleSetFilePrioritySuccess(action.data);
      break;
    case 'CLIENT_SET_TRACKER_SUCCESS':
      // TODO: popup set tracker success message here
      break;
    case 'CLIENT_SET_TRACKER_ERROR':
      // TODO: popup set tracker failed message here
      break;
    case 'UI_CLICK_TORRENT':
      TorrentStore.setSelectedTorrents(action.data);
      break;
    case 'UI_SET_TORRENT_SORT':
      TorrentStore.triggerTorrentsSort(action.data);
      break;
    case 'UI_SET_TORRENT_SEARCH_FILTER':
    case 'UI_SET_TORRENT_STATUS_FILTER':
    case 'UI_SET_TORRENT_TAG_FILTER':
    case 'UI_SET_TORRENT_TRACKER_FILTER':
      TorrentStore.triggerTorrentsFilter();
      break;
    case 'SETTINGS_FETCH_REQUEST_SUCCESS':
      if (SettingsStore.dispatcherID != null) {
        AppDispatcher.waitFor([SettingsStore.dispatcherID]);
        TorrentStore.handleFetchSettingsRequest();
      }
      break;
    default:
      break;
  }
});

export default TorrentStore;
