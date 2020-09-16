import serverEventTypes from '@shared/constants/serverEventTypes';
import type {TorrentFile} from '@shared/constants/torrentFilePropsMap';
import type {TorrentPeer} from '@shared/constants/torrentPeerPropsMap';

import AlertStore from './AlertStore';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import ConfigStore from './ConfigStore';
import {filterTorrents} from '../util/filterTorrents';
import {searchTorrents} from '../util/searchTorrents';
import {selectTorrents} from '../util/selectTorrents';
import SettingsStore from './SettingsStore';
import {sortTorrents} from '../util/sortTorrents';
import TorrentActions from '../actions/TorrentActions';
import TorrentFilterStore from './TorrentFilterStore';
import UIStore from './UIStore';

import type {FloodSettings} from './SettingsStore';

export interface Duration {
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  cumSeconds: number;
}

interface TorrentDetails {
  fileTree: {
    files: Array<TorrentFile>;
    peers: Array<TorrentPeer>;
    trackers: Array<TorrentTracker>;
  };
}

// TODO: Unite with torrentTrackerPropsMap when it is TS.
export interface TorrentTracker {
  index: number;
  id: string;
  url: string;
  type: number;
  group: number;
  minInterval: number;
  normalInterval: number;
}

// TODO: Rampant over-fetching of torrent properties. Need to remove unused items.
// TODO: Unite with torrentListPropMap when it is TS.
export interface TorrentProperties {
  baseDirectory: string;
  baseFilename: string;
  basePath: string;
  bytesDone: number;
  comment: string;
  dateAdded: string;
  dateCreated: string;
  details: TorrentDetails;
  directory: string;
  downRate: number;
  downTotal: number;
  eta: 'Infinity' | Duration;
  hash: string;
  ignoreScheduler: boolean;
  isActive: boolean;
  isComplete: boolean;
  isHashing: string;
  isMultiFile: boolean;
  isOpen: boolean;
  isPrivate: boolean;
  isStateChanged: boolean;
  message: string;
  name: string;
  peersConnected: number;
  peersTotal: number;
  percentComplete: number;
  priority: string;
  ratio: number;
  seedingTime: string;
  seedsConnected: number;
  seedsTotal: number;
  sizeBytes: number;
  state: string;
  status: Array<string>;
  tags: Array<string>;
  throttleName: string;
  trackerURIs: Array<string>;
  upRate: number;
  upTotal: number;
}

interface TorrentPropertiesDiff {
  [hash: string]: {
    action: string;
    data?: Partial<TorrentProperties>;
  };
}

export interface Torrents {
  [hash: string]: TorrentProperties;
}

const pollInterval: number = ConfigStore.getPollInterval();

class TorrentStoreClass extends BaseStore {
  filteredTorrents: Array<TorrentProperties> = [];
  mediainfo: Record<string, string> = {}; // hash: mediainfo output
  pollTorrentDetailsIntervalID: number | null = null;
  selectedTorrents: Array<string> = [];
  sortedTorrents: Array<TorrentProperties> = [];
  sortTorrentsBy: FloodSettings['sortTorrents'] = {direction: 'desc', property: 'dateAdded'};
  torrents: Torrents = {};

  fetchTorrentDetails(options: {forceUpdate?: boolean} = {}) {
    // TODO: Rampant and frequent over-fetching observed.
    if (!this.isRequestPending('fetch-torrent-details') || options.forceUpdate) {
      this.beginRequest('fetch-torrent-details');
      TorrentActions.fetchTorrentDetails(UIStore.getTorrentDetailsHash());
    }

    if (this.pollTorrentDetailsIntervalID === null) {
      this.startPollingTorrentDetails();
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
    this.emit('FLOOD_FETCH_MEDIAINFO_SUCCESS');
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

  handleMoveTorrentsError(error: Error & {count: number}) {
    this.emit('CLIENT_MOVE_TORRENTS_REQUEST_ERROR');

    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.move.failed',
        value: error.count,
      },
      id: 'alert.torrent.move.failed',
    });
  }

  handleRemoveTorrentsSuccess(response: {count: number; deleteData: boolean}) {
    SettingsStore.setFloodSetting('deleteTorrentData', response.deleteData);

    AlertStore.add({
      accumulation: {
        id: 'alert.torrent.remove',
        value: response.count,
      },
      id: 'alert.torrent.remove',
    });
  }

  handleRemoveTorrentsError(error: Error & {count: number}) {
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

  handleSetFilePrioritySuccess() {
    this.emit('CLIENT_SET_FILE_PRIORITY_SUCCESS');
    this.fetchTorrentDetails({forceUpdate: true});
  }

  handleTorrentListDiffChange(torrentListDiff: TorrentPropertiesDiff) {
    Object.keys(torrentListDiff).forEach((torrentHash) => {
      const {action, data} = torrentListDiff[torrentHash];

      switch (action) {
        case serverEventTypes.TORRENT_LIST_ACTION_TORRENT_ADDED:
          this.torrents[torrentHash] = data as TorrentProperties;
          break;
        case serverEventTypes.TORRENT_LIST_ACTION_TORRENT_DELETED:
          if (this.selectedTorrents.includes(torrentHash)) {
            this.selectedTorrents = this.selectedTorrents.filter((hash: string) => hash !== torrentHash);
          }

          delete this.torrents[torrentHash];
          break;
        case serverEventTypes.TORRENT_LIST_ACTION_TORRENT_DETAIL_UPDATED:
          if (data == null) {
            break;
          }
          Object.assign(this.torrents[torrentHash], data);
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
    this.sortedTorrents = sortTorrents(this.torrents, this.getTorrentsSort());
  }

  startPollingTorrentDetails() {
    this.pollTorrentDetailsIntervalID = setInterval(this.fetchTorrentDetails.bind(this), pollInterval);
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
      TorrentStore.handleFetchTorrentDetails(action.data as {hash: string; torrentDetails: TorrentDetails});
      break;
    case 'CLIENT_ADD_TORRENT_ERROR':
      TorrentStore.handleAddTorrentError();
      break;
    case 'CLIENT_ADD_TORRENT_SUCCESS':
      TorrentStore.handleAddTorrentSuccess(action.data as {count: number; destination: string});
      break;
    case 'TORRENT_LIST_DIFF_CHANGE':
      TorrentStore.handleTorrentListDiffChange(action.data as TorrentPropertiesDiff);
      break;
    case 'TORRENT_LIST_FULL_UPDATE':
      TorrentStore.handleTorrentListFullUpdate(action.data as Torrents);
      break;
    case 'CLIENT_MOVE_TORRENTS_SUCCESS':
      TorrentStore.handleMoveTorrentsSuccess(action.data as {count: number});
      break;
    case 'CLIENT_MOVE_TORRENTS_ERROR':
      TorrentStore.handleMoveTorrentsError(action.error as Error & {count: number});
      break;
    case 'CLIENT_REMOVE_TORRENT_SUCCESS':
      TorrentStore.handleRemoveTorrentsSuccess(action.data as {count: number; deleteData: boolean});
      break;
    case 'CLIENT_REMOVE_TORRENT_ERROR':
      TorrentStore.handleRemoveTorrentsError(action.error as Error & {count: number});
      break;
    case 'CLIENT_SET_FILE_PRIORITY_SUCCESS':
      TorrentStore.handleSetFilePrioritySuccess();
      break;
    case 'CLIENT_SET_TRACKER_SUCCESS':
      // TODO: popup set tracker success message here
      break;
    case 'CLIENT_SET_TRACKER_ERROR':
      // TODO: popup set tracker failed message here
      break;
    case 'FLOOD_FETCH_MEDIAINFO_SUCCESS':
      TorrentStore.handleFetchMediainfoSuccess(action.data as {hash: string; output: string});
      break;
    case 'UI_CLICK_TORRENT':
      TorrentStore.setSelectedTorrents(action.data as {event: React.MouseEvent<HTMLLIElement>; hash: string});
      break;
    case 'UI_SET_TORRENT_SORT':
      TorrentStore.triggerTorrentsSort(action.data as FloodSettings['sortTorrents']);
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
