// WRONG API documentation: dl_limit and up_limit are actually in bytes per second
export interface QBittorrentAppPreferences {
  dht: boolean;
  pex: boolean;
  // Default save path for torrents, separated by slashes
  save_path: string;
  // Maximum global number of simultaneous connections
  max_connec: number;
  // Maximum number of simultaneous connections per torrent
  max_connec_per_torrent: number;
  // Maximum number of upload slots
  max_uploads: number;
  // Maximum number of upload slots per torrent
  max_uploads_per_torrent: number;
  // IP announced to trackers
  announce_ip: string;
  // Port for incoming connections
  listen_port: number;
  // True if the port is randomly selected
  random_port: boolean;
  // Global download speed limit in KiB/s; `-1` means no limit is applied
  dl_limit: number;
  // Global upload speed limit in KiB/s; `-1` means no limit is applied
  up_limit: number;
}
