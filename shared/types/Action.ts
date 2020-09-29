import {TorrentProperties} from './Torrent';

// POST /api/client/add
export interface AddTorrentByURLOptions {
  urls: Array<string>;
  destination: string;
  isBasePath: boolean;
  start: boolean;
  tags?: Array<string>;
}

// POST /api/client/torrents/check-hash
export interface CheckTorrentsOptions {
  // An array of string representing hashes of torrents to be checked
  hashes: Array<TorrentProperties['hash']>;
}

// POST /api/client/torrents/delete
export interface DeleteTorrentsOptions {
  // An array of string representing hashes of torrents to be removed
  hashes: Array<TorrentProperties['hash']>;
  // Whether to delete data of torrents
  deleteData?: boolean;
}

// POST /api/client/torrents/move
export interface MoveTorrentsOptions {
  // Hashes of torrents to be moved
  hashes: Array<TorrentProperties['hash']>;
  // Path of destination
  destination: string;
  // Whether to move data of torrents
  moveFiles: boolean;
  // Whether destination is the base path
  isBasePath: boolean;
  // Whether to check hash after completion
  isCheckHash: boolean;
}

// POST /api/client/torrents/start
export interface StartTorrentsOptions {
  // An array of string representing hashes of torrents to be started
  hashes: Array<TorrentProperties['hash']>;
}

// POST /api/client/torrents/stop
export interface StopTorrentsOptions {
  // An array of string representing hashes of torrents to be stopped
  hashes: Array<TorrentProperties['hash']>;
}
