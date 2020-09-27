import {TorrentProperties} from './Torrent';

export interface AddTorrentByURLOptions {
  urls: Array<string>;
  destination: string;
  isBasePath: boolean;
  start: boolean;
  tags?: Array<string>;
}

export interface MoveTorrentsOptions {
  destination: string;
  isBasePath: boolean;
  filenames: Array<string>;
  sourcePaths: Array<string>;
  moveFiles: boolean;
  isCheckHash: boolean;
}

export interface DeleteTorrentsOptions {
  // An array of string representing hashes of torrents to be removed
  hashes: Array<TorrentProperties['hash']>;
  // Whether to delete data of torrents
  deleteData?: boolean;
}
