import {TorrentStatus} from '../constants/torrentStatusMap';

export interface Duration {
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  cumSeconds: number;
}

export interface TorrentDetails {
  fileTree: {
    files: Array<{
      index: number;
      filename: string;
      path: string;
      percentComplete: number;
      priority: number;
      sizeBytes: number;
    }>;
    peers: Array<TorrentPeer>;
    trackers: Array<TorrentTracker>;
  };
}

// TODO: Unite with torrentPeerPropsMap when it is TS.
export interface TorrentPeer {
  index: number;
  country: string;
  address: string;
  completedPercent: number;
  clientVersion: string;
  downloadRate: number;
  downloadTotal: number;
  uploadRate: number;
  uploadTotal: number;
  id: string;
  peerRate: number;
  peerTotal: number;
  isEncrypted: boolean;
  isIncoming: boolean;
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
  status: Array<TorrentStatus>;
  tags: Array<string>;
  throttleName: string;
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

export interface Torrents {
  [hash: string]: TorrentProperties;
}
