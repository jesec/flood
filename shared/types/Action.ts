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
