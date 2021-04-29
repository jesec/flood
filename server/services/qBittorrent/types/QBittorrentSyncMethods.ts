export interface QBittorrentTorrentPeer {
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

export interface QBittorrentSyncTorrentPeers {
  rid: number;
  peers?: {
    [ip_and_port: string]: QBittorrentTorrentPeer;
  };
  peers_removed?: string[];
}

export type QBittorrentTorrentPeers = Exclude<QBittorrentSyncTorrentPeers['peers'], undefined>;
