import {TorrentProperties} from './Torrent';

// POST /api/client/add
export interface AddTorrentByURLOptions {
  urls: Array<string>;
  destination: string;
  isBasePath: boolean;
  start: boolean;
  tags?: Array<string>;
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
  destination: string;
  isBasePath: boolean;
  filenames: Array<string>;
  sourcePaths: Array<string>;
  moveFiles: boolean;
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
