export type QBittorrentTorrentState =
  | 'error'
  | 'missingFiles'
  | 'uploading'
  | 'pausedUP'
  | 'stoppedUP'
  | 'queuedUP'
  | 'stalledUP'
  | 'checkingUP'
  | 'forcedUP'
  | 'allocating'
  | 'downloading'
  | 'metaDL'
  | 'forcedMetaDL'
  | 'pausedDL'
  | 'stoppedDL'
  | 'queuedDL'
  | 'stalledDL'
  | 'checkingDL'
  | 'forcedDL'
  | 'checkingResumeData'
  | 'moving'
  | 'unknown';

export interface QBittorrentTorrentInfo {
  // Time (Unix Epoch) when the torrent was added to the client
  added_on: number;
  // Amount of data left to download (bytes)
  amount_left: number;
  // Whether this torrent is managed by Automatic Torrent Management
  auto_tmm: boolean;
  // Percentage of file pieces currently available
  availability: number;
  // Category of the torrent
  category: string;
  // Amount of transfer data completed (bytes)
  completed: number;
  // Time (Unix Epoch) when the torrent completed
  completion_on: number;
  // Torrent download speed limit (bytes/s). -1 if unlimited.
  dl_limit: number;
  // Torrent download speed (bytes/s)
  dlspeed: number;
  // Amount of data downloaded
  downloaded: number;
  // Amount of data downloaded this session
  downloaded_session: number;
  // Torrent ETA (seconds)
  eta: number;
  // True if first last piece are prioritized
  f_l_piece_prio: boolean;
  // True if force start is enabled for this torrent
  force_start: boolean;
  // Torrent hash
  hash: string;
  // Last time (Unix Epoch) when a chunk was downloaded/uploaded
  last_activity: number;
  // Magnet URI corresponding to this torrent
  magnet_uri: string;
  // Maximum share ratio until torrent is stopped from seeding/uploading
  max_ratio: number;
  // Maximum seeding time (seconds) until torrent is stopped from seeding
  max_seeding_time: number;
  // Torrent name
  name: string;
  // Number of seeds in the swarm
  num_complete: number;
  // Number of leechers in the swarm
  num_incomplete: number;
  // Number of leechers connected to
  num_leechs: number;
  // Number of seeds connected to
  num_seeds: number;
  // Torrent priority. Returns -1 if queuing is disabled or torrent is in seed mode
  priority: number;
  // Torrent progress (percentage/100)
  progress: number;
  // Torrent share ratio. Max ratio value: 9999.
  ratio: number;
  // TODO (what is different from max_ratio?)
  ratio_limit: number;
  // Path where this torrent's data is stored
  save_path: string;
  // TODO (what is different from max_seeding_time?)
  seeding_time_limit: number;
  // Time (Unix Epoch) when this torrent was last seen complete
  seen_complete: number;
  // True if sequential download is enabled
  seq_dl: boolean;
  // Total size (bytes) of files selected for download
  size: number;
  // Torrent state
  state: QBittorrentTorrentState;
  // True if super seeding is enabled
  super_seeding: boolean;
  // Comma-concatenated tag list of the torrent
  tags: string;
  // Total active time (seconds)
  time_active: number;
  // Total size (bytes) of all file in this torrent (including unselected ones)
  total_size: number;
  // The first tracker with working status. Returns empty string if no tracker is working.
  tracker: string;
  // Torrent upload speed limit (bytes/s). -1 if unlimited.
  up_limit: number;
  // Amount of data uploaded
  uploaded: number;
  // Amount of data uploaded this session
  uploaded_session: number;
  // Torrent upload speed (bytes/s)
  upspeed: number;
}

export type QBittorrentTorrentInfos = Array<QBittorrentTorrentInfo>;

export interface QBittorrentTorrentsAddOptions {
  // Download folder
  savepath?: string;
  // Cookie sent to download the .torrent file
  cookie?: string;
  // Category for the torrent
  category?: string;
  // Tags for the torrent, split by ','
  tags?: string;
  // Skip hash checking. Possible values are true, false (default)
  skip_checking?: boolean;
  // Add torrents in the paused state. Possible values are true, false (default)
  paused?: boolean;
  // Add torrents in the stopped state (using webapiVersion v2.11.0 or later). Possible values are true, false (default)
  stopped?: boolean;
  // Create the root folder. Possible values are true, false, unset (default)
  root_folder?: boolean;
  // Content layout mode, replaces root_folder
  contentLayout?: 'Original' | 'Subfolder' | 'NoSubfolder';
  // Rename torrent
  rename?: string;
  // Set torrent upload speed limit. Unit in bytes/second
  upLimit?: number;
  // Set torrent download speed limit. Unit in bytes/second
  dlLimit?: number;
  // Whether Automatic Torrent Management should be used
  autoTMM?: boolean;
  // Enable sequential download. Possible values are true, false (default)
  sequentialDownload?: boolean;
  // Prioritize download first last piece. Possible values are true, false (default)
  firstLastPiecePrio?: boolean;
}

export enum QBittorrentTorrentContentPriority {
  DO_NOT_DOWNLOAD = 0,
  NORMAL = 1,
  HIGH = 6,
  MAXIMUM = 7,
}

export interface QBittorrentTorrentContent {
  // File name (including relative path)
  name: string;
  // File size (bytes)
  size: number;
  // File progress (percentage/100)
  progress: number;
  // File priority
  priority: QBittorrentTorrentContentPriority;
  // True if file is seeding/complete
  is_seed: boolean;
  // The first number is the starting piece index and the second number is the ending piece index (inclusive)
  piece_range: Array<number>;
  // Percentage of file pieces currently available
  availability: number;
}

export type QBittorrentTorrentContents = Array<QBittorrentTorrentContent>;

export interface QBittorrentTorrentProperties {
  // Torrent save path
  save_path: string;
  // Torrent creation date (Unix timestamp)
  creation_date: number;
  // Torrent piece size (bytes)
  piece_size: number;
  // Torrent comment
  comment: string;
  // Total data wasted for torrent (bytes)
  total_wasted: number;
  // Total data uploaded for torrent (bytes)
  total_uploaded: number;
  // Total data uploaded this session (bytes)
  total_uploaded_session: number;
  // Total data downloaded for torrent (bytes)
  total_downloaded: number;
  // Total data downloaded this session (bytes)
  total_downloaded_session: number;
  // Torrent upload limit (bytes/s)
  up_limit: number;
  // Torrent download limit (bytes/s)
  dl_limit: number;
  // Torrent elapsed time (seconds)
  time_elapsed: number;
  // Torrent elapsed time while complete (seconds)
  seeding_time: number;
  // Torrent connection count
  nb_connections: number;
  // Torrent connection count limit
  nb_connections_limit: number;
  // Torrent share ratio
  share_ratio: number;
  // When this torrent was added (unix timestamp)
  addition_date: number;
  // Torrent completion date (unix timestamp)
  completion_date: number;
  // Torrent creator
  created_by: string;
  // Torrent average download speed (bytes/second)
  dl_speed_avg: number;
  // Torrent download speed (bytes/second)
  dl_speed: number;
  // Torrent ETA (seconds)
  eta: number;
  // Last seen complete date (unix timestamp)
  last_seen: number;
  // Number of peers connected to
  peers: number;
  // Number of peers in the swarm
  peers_total: number;
  // Number of pieces owned
  pieces_have: number;
  // Number of pieces of the torrent
  pieces_num: number;
  // Number of seconds until the next announce
  reannounce: number;
  // Number of seeds connected to
  seeds: number;
  // Number of seeds in the swarm
  seeds_total: number;
  // Torrent total size (bytes)
  total_size: number;
  // Torrent average upload speed (bytes/second)
  up_speed_avg: number;
  // Torrent upload speed (bytes/second)
  up_speed: number;
}

export enum QBittorrentTorrentTrackerStatus {
  // Tracker is disabled (used for DHT, PeX, and LSD)
  DISABLED = 0,
  // Tracker has not been contacted yet
  NOT_CONTACTED = 1,
  // Tracker has been contacted and is working
  CONTACTED = 2,
  // Tracker is updating
  UPDATING = 3,
  // Tracker has been contacted, but it is not working (or doesn't send proper replies)
  ERROR = 4,
}

export interface QBittorrentTorrentTracker {
  // Tracker url
  url: string;
  // Tracker status
  status: QBittorrentTorrentTrackerStatus;
  // Tracker priority tier. Lower tier trackers are tried before higher tiers
  tier: number;
  // Number of peers for current torrent, as reported by the tracker
  num_peers: number;
  // Number of seeds for current torrent, as reported by the tracker
  num_seeds: number;
  // Number of leeches for current torrent, as reported by the tracker
  num_leeches: number;
  // Number of completed downloads for current torrent, as reported by the tracker
  num_downloaded: number;
  // Tracker message (there is no way of knowing what this message is - it's up to tracker admins)
  msg: string;
}

export type QBittorrentTorrentTrackers = Array<QBittorrentTorrentTracker>;
