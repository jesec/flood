import type {TorrentContent} from './TorrentContent';
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
  contents: Array<TorrentContent>;
  peers: Array<TorrentPeer>;
  trackers: Array<TorrentTracker>;
}

export enum TorrentPriority {
  DO_NOT_DOWNLOAD = 0,
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
}

export interface TorrentProperties {
  baseDirectory: string;
  baseFilename: string;
  basePath: string;
  bytesDone: number;
  dateAdded: number;
  dateCreated: number;
  directory: string;
  downRate: number;
  downTotal: number;
  eta: -1 | Duration;
  hash: string;
  isMultiFile: boolean;
  isPrivate: boolean;
  message: string;
  name: string;
  peersConnected: number;
  peersTotal: number;
  percentComplete: number;
  priority: TorrentPriority;
  ratio: number;
  seedsConnected: number;
  seedsTotal: number;
  sizeBytes: number;
  status: Array<TorrentStatus>;
  tags: Array<string>;
  trackerURIs: Array<string>;
  upRate: number;
  upTotal: number;
}

export interface TorrentList {
  [hash: string]: TorrentProperties;
}

export interface TorrentListSummary {
  id: number;
  torrents: TorrentList;
}
