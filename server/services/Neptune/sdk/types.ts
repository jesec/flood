// ── Torrent state ────────────────────────────────────────────────────

/**
 * BitTorrent state as reported by Neptune.
 *
 * - `Stopped`      – torrent is paused.
 * - `Downloading`  – actively downloading pieces.
 * - `Seeding`      – download complete, uploading to peers.
 * - `Checking`     – verifying local data against piece hashes.
 * - `Moving`       – relocating data files.
 * - `Error`        – fatal error, torrent is stopped.
 */
export type TorrentState = 'Stopped' | 'Downloading' | 'Seeding' | 'Checking' | 'Moving' | 'Error';

// ── Domain types ─────────────────────────────────────────────────────

/** Summary of a single torrent returned by `torrent.list`. */
export interface Torrent {
  hash: string;
  name: string;
  state: TorrentState;
  comment: string;
  directory_base: string;
  message: string;
  tracker_errors: Record<string, string>;
  tags: string[];
  custom: Record<string, string>;
  download_rate: number;
  download_total: number;
  upload_rate: number;
  upload_total: number;
  connection_count: number;
  completed: number;
  total_length: number;
  selected_size: number;
  add_at: number;
  private: boolean;
  total_seeding: number;
  total_downloading: number;
  connected_seeding: number;
  connected_downloading: number;
}

/** Global transfer rates and totals. */
export interface TransferSummary {
  download_rate: number;
  download_total: number;
  upload_rate: number;
  upload_total: number;
}

/** A single file inside a torrent. */
export interface TorrentFile {
  path: string[];
  index: number;
  progress: number;
  size: number;
}

/** A connected peer. */
export interface Peer {
  address: string;
  client: string;
  progress: number;
  download_rate: number;
  upload_rate: number;
  is_incoming: boolean;
}

/** A tracker entry. */
export interface Tracker {
  url: string;
  message: string;
  tier: number;
}

/** Basic torrent metadata from `torrent.get`. */
export interface TorrentInfo {
  name: string;
  tags: string[];
  custom: Record<string, string>;
}

// ── Response wrappers ────────────────────────────────────────────────

export interface TorrentList {
  torrents: Torrent[];
}

export interface TorrentFiles {
  files: TorrentFile[];
}

export interface TorrentPeers {
  peers: Peer[];
}

export interface TorrentTrackers {
  trackers: Tracker[];
}

export interface AddTorrentResult {
  info_hash: string;
}

// ── Request types ────────────────────────────────────────────────────

export interface AddTorrentParams {
  /** Base64-encoded torrent file content. */
  torrent_file: string;
  /** Base download directory. If omitted the global default is used. */
  download_dir?: string;
  /** Tags to attach to the torrent. */
  tags?: string[];
  /** Custom key-value metadata. */
  custom?: Record<string, string>;
  /** Indices of files to download. Omit or empty to download all. */
  selected_files?: number[];
  /** When true, the torrent name is not appended to `download_dir`. */
  is_base_dir?: boolean;
  /** When true, skip piece hash check and only verify file sizes. */
  skip_hash_check?: boolean;
}

export interface InfoHashParams {
  /** 40-character lowercase hex-encoded SHA-1 info hash. */
  info_hash: string;
}

export interface RemoveTorrentParams extends InfoHashParams {
  /** When true, also delete downloaded data files from disk. */
  delete_data?: boolean;
}

export interface MoveTorrentParams extends InfoHashParams {
  /** New base directory for the torrent data. */
  target_base_path: string;
}

export interface TagsParams extends InfoHashParams {
  tags: string[];
}

export interface SetFilePriorityParams extends InfoHashParams {
  file_ids: number[];
  /** 0 = skip (do not download), 1 = normal (download). */
  priority: number;
}

export interface SpeedLimitParams extends InfoHashParams {
  /** Speed limit in bytes/s. 0 or negative = unlimited. */
  limit: number;
}

export interface GlobalSpeedLimitParams {
  /** Speed limit in bytes/s. 0 or negative = unlimited. */
  limit: number;
}

/** Response for client.get_transfer_config. */
export interface TransferConfig {
  download_limit: number;
  upload_limit: number;
}

export interface ListTorrentParams {
  /** Custom keys to include in the response. Omit for all keys. */
  keys?: string[];
}

export interface AddTrackerParams extends InfoHashParams {
  url: string;
  /** Tier index. Appends to a new tier if out of range. Default 0. */
  tier?: number;
}

export interface RemoveTrackerParams extends InfoHashParams {
  url: string;
}

export interface ReplaceTrackersParams extends InfoHashParams {
  /** Map of old tracker URL → new tracker URL. */
  replacements: Record<string, string>;
}

export interface SetCustomParams extends InfoHashParams {
  key: string;
  value: string;
}

export interface UpdateCustomParams extends InfoHashParams {
  custom: Record<string, string>;
}

export interface DelCustomParams extends InfoHashParams {
  key: string;
}
