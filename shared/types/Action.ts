import {TorrentProperties} from './Torrent';

// POST /api/torrents/add-urls
export interface AddTorrentByURLOptions {
  // URLs to download torrents from
  urls: Array<string>;
  // Path of destination
  destination: string;
  // Tags
  tags?: Array<string>;
  // Whether destination is the base path
  isBasePath: boolean;
  // Whether to start torrent
  start: boolean;
}

// POST /api/torrents/add-files
export interface AddTorrentByFileOptions {
  // Torrent files in base64
  files: Array<string>;
  // Path of destination
  destination: string;
  // Tags
  tags?: Array<string>;
  // Whether destination is the base path
  isBasePath: boolean;
  // Whether to start torrent
  start: boolean;
}

// POST /api/torrents/check-hash
export interface CheckTorrentsOptions {
  // An array of string representing hashes of torrents to be checked
  hashes: Array<TorrentProperties['hash']>;
}

// POST /api/torrents/delete
export interface DeleteTorrentsOptions {
  // An array of string representing hashes of torrents to be removed
  hashes: Array<TorrentProperties['hash']>;
  // Whether to delete data of torrents
  deleteData?: boolean;
}

// POST /api/torrents/move
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

// POST /api/torrents/start
export interface StartTorrentsOptions {
  // An array of string representing hashes of torrents to be started
  hashes: Array<TorrentProperties['hash']>;
}

// POST /api/torrents/stop
export interface StopTorrentsOptions {
  // An array of string representing hashes of torrents to be stopped
  hashes: Array<TorrentProperties['hash']>;
}

// PATCH /api/torrents/priority
export interface SetTorrentsPriorityOptions {
  // An array of string representing hashes of torrents to operate on
  hashes: Array<TorrentProperties['hash']>;
  // Number representing priority:
  // 0 - DON'T_DOWNLOAD
  // 1 - LOW
  // 2 - NORMAL
  // 3 - HIGH
  priority: number;
}

// PATCH /api/torrents/tags
export interface SetTorrentsTagsOptions {
  // An array of string representing hashes of torrents to operate on
  hashes: Array<TorrentProperties['hash']>;
  // An array of string representing tags
  tags: TorrentProperties['tags'];
}

// PATCH /api/torrents/{hash}/contents
export interface SetTorrentContentsPropertiesOptions {
  // An array of number representing indices of contents of a torrent
  indices: Array<number>;
  // Number representing priority:
  // 0 - DON'T_DOWNLOAD
  // 1 - NORMAL
  // 2 - HIGH
  priority: number;
}
