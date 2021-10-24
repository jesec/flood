import {QBittorrentTorrentInfo} from './QBittorrentTorrentsMethods';
import {QBittorrentTransferInfo} from './QBittorrentTransferMethods';

export interface QBittorrentCategory {
  name: string;
  savePath: string;
}

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

export interface QBittorrentSyncMainData {
  rid: number;
  full_update?: boolean;
  categories?: {
    [name: string]: QBittorrentCategory;
  };
  categories_removed?: string[];
  server_state?: QBittorrentTransferInfo;
  tags?: string[];
  tags_removed?: string[];
  torrents?: {
    [hash: string]: QBittorrentTorrentInfo;
  };
  torrents_removed?: string[];
  trackers?: {
    [url: string]: string[];
  };
  trackers_removed: string[];
}

export type QBittorrentMainData = Required<
  Pick<QBittorrentSyncMainData, 'categories' | 'server_state' | 'tags' | 'torrents' | 'trackers'>
>;

export interface QBittorrentSyncTorrentPeers {
  rid: number;
  peers: {
    [ip_and_port: string]: QBittorrentTorrentPeer;
  };
  peers_removed?: string[];
}

export type QBittorrentTorrentPeers = Exclude<QBittorrentSyncTorrentPeers['peers'], undefined>;
