import type {TorrentContentTree} from './TorrentContent';
import type {TorrentPeer} from './TorrentPeer';
import type {TorrentStatus} from '../constants/torrentStatusMap';
import type {TorrentTracker} from './TorrentTracker';

export interface Duration {
  years?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  cumSeconds: number;
}

export interface TorrentDetails {
  peers: Array<TorrentPeer>;
  trackers: Array<TorrentTracker>;
  fileTree: TorrentContentTree;
}

// TODO: Rampant over-fetching of torrent properties. Need to remove unused items.
// TODO: Unite with torrentListPropMap when it is TS.
export interface TorrentProperties {
  baseDirectory: string;
  baseFilename: string;
  basePath: string;
  bytesDone: number;
  dateAdded: number;
  dateCreated: number;
  details?: TorrentDetails;
  directory: string;
  downRate: number;
  downTotal: number;
  eta: -1 | Duration;
  hash: string;
  isActive: boolean;
  isComplete: boolean;
  isHashing: boolean;
  isMultiFile: boolean;
  isOpen: boolean;
  isPrivate: boolean;
  message: string;
  name: string;
  peersConnected: number;
  peersTotal: number;
  percentComplete: number;
  priority: number;
  ratio: number;
  seedsConnected: number;
  seedsTotal: number;
  sizeBytes: number;
  state: string;
  status: Array<TorrentStatus>;
  tags: Array<string>;
  trackerURIs: Array<string>;
  upRate: number;
  upTotal: number;
}

export interface TorrentListDiff {
  [hash: string]:
    | {
        action: 'TORRENT_LIST_ACTION_TORRENT_ADDED';
        data: TorrentProperties;
      }
    | {
        action: 'TORRENT_LIST_ACTION_TORRENT_DELETED';
      }
    | {
        action: 'TORRENT_LIST_ACTION_TORRENT_DETAIL_UPDATED';
        data: Partial<TorrentProperties>;
      };
}

export interface TorrentList {
  [hash: string]: TorrentProperties;
}

export interface TorrentListSummary {
  id: number;
  torrents: TorrentList;
}
