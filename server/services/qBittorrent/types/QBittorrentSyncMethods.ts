export interface QBittorrentSyncTorrentPeer {
  client: string;
  connection: string;
  country: string;
  country_code: string;
  dl_speed: number;
  downloaded: number;
  up_speed: number;
  uploaded: number;
  files: string;
  flags: string;
  flags_desc: string;
  ip: string;
  port: number;
  progress: number;
  relevance: number;
}

export type QBittorrentSyncTorrentPeers = {
  [ip_and_port: string]: QBittorrentSyncTorrentPeer;
};
