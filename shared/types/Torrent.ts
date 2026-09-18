import type {TorrentStatus} from '../constants/torrentStatusMap';
import type {TorrentContent} from './TorrentContent';
import type {TorrentPeer} from './TorrentPeer';
import type {TorrentTracker} from './TorrentTracker';

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

// Health score levels based on seeder availability
export enum TorrentHealth {
  CRITICAL = 0, // No seeders
  POOR = 1, // Very few seeders (1-2)
  FAIR = 2, // Some seeders (3-5)
  GOOD = 3, // Healthy seeder count (6-10)
  EXCELLENT = 4, // Many seeders (10+)
}

export interface TorrentProperties {
  bytesDone: number;
  comment: string;
  // Last time the torrent is active, -1 means currently active, 0 means data unavailable
  dateActive: number;
  dateAdded: number;
  dateCreated: number;
  dateFinished: number;
  directory: string;
  downRate: number;
  downTotal: number;
  // Torrent ETA (seconds), -1 means infinity
  eta: number;
  // Upper-case hash of info section of the torrent
  hash: string;
  // Health score based on seeder availability (0-4, higher is better)
  health: TorrentHealth;
  isPrivate: boolean;
  // If initial seeding mode (aka super seeding) is enabled
  isInitialSeeding: boolean;
  // If sequential download is enabled
  isSequential: boolean;
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
  selectedSizeBytes: number;
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
