import axios, {type AxiosInstance} from 'axios';

// ── Request types ────────────────────────────────────────────────────

interface InfoHashParams {
  info_hash: string;
}

interface AddTorrentParams {
  torrent_file: string;
  download_dir?: string;
  tags?: string[];
  custom?: Record<string, string>;
  selected_files?: number[];
  is_base_dir?: boolean;
  skip_hash_check?: boolean;
}

interface RemoveTorrentParams extends InfoHashParams {
  delete_data?: boolean;
}

interface MoveTorrentParams extends InfoHashParams {
  target_base_path: string;
}

interface TagsParams extends InfoHashParams {
  tags: string[];
}

interface SetFilePriorityParams extends InfoHashParams {
  file_ids: number[];
  priority: number;
}

interface AddTrackerParams extends InfoHashParams {
  url: string;
  tier?: number;
}

interface RemoveTrackerParams extends InfoHashParams {
  url: string;
}

interface ReplaceTrackersParams extends InfoHashParams {
  replacements: Record<string, string>;
}

interface SetCustomParams extends InfoHashParams {
  key: string;
  value: string;
}

interface UpdateCustomParams extends InfoHashParams {
  custom: Record<string, string>;
}

interface DelCustomParams extends InfoHashParams {
  key: string;
}

interface SpeedLimitParams extends InfoHashParams {
  limit: number;
}

interface GlobalSpeedLimitParams {
  limit: number;
}

interface ListTorrentParams {
  keys?: string[];
}

// ── Response types ───────────────────────────────────────────────────

export interface NeptuneTorrent {
  hash: string;
  name: string;
  state: string;
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
}

export interface NeptuneTorrentList {
  torrents: NeptuneTorrent[];
}

export interface NeptuneTransferSummary {
  download_rate: number;
  download_total: number;
  upload_rate: number;
  upload_total: number;
}

export interface NeptuneTorrentFile {
  path: string[];
  index: number;
  progress: number;
  size: number;
}

export interface NeptuneTorrentFiles {
  files: NeptuneTorrentFile[];
}

export interface NeptunePeer {
  address: string;
  client: string;
  progress: number;
  download_rate: number;
  upload_rate: number;
  is_incoming: boolean;
}

export interface NeptuneTorrentPeers {
  peers: NeptunePeer[];
}

export interface NeptuneTracker {
  url: string;
  message: string;
  tier: number;
}

export interface NeptuneTorrentTrackers {
  trackers: NeptuneTracker[];
}

export interface NeptuneTorrentInfo {
  name: string;
  tags: string[];
  custom: Record<string, string>;
}

export interface NeptuneAddTorrentResult {
  info_hash: string;
}

export type NeptuneTorrentState = 'Stopped' | 'Downloading' | 'Seeding' | 'Checking' | 'Moving' | 'Error';

// ── Method map ───────────────────────────────────────────────────────

interface NeptuneMethodMap {
  'system.ping': {req: Record<string, never>; res: void};
  transfer_summary: {req: Record<string, never>; res: NeptuneTransferSummary};
  'torrent.list': {req: ListTorrentParams; res: NeptuneTorrentList};
  'torrent.get': {req: InfoHashParams; res: NeptuneTorrentInfo};
  'torrent.files': {req: InfoHashParams; res: NeptuneTorrentFiles};
  'torrent.peers': {req: InfoHashParams; res: NeptuneTorrentPeers};
  'torrent.trackers': {req: InfoHashParams; res: NeptuneTorrentTrackers};
  'torrent.add': {req: AddTorrentParams; res: NeptuneAddTorrentResult};
  'torrent.remove': {req: RemoveTorrentParams; res: void};
  'torrent.start': {req: InfoHashParams; res: void};
  'torrent.stop': {req: InfoHashParams; res: void};
  'torrent.recheck': {req: InfoHashParams; res: void};
  'torrent.move': {req: MoveTorrentParams; res: void};
  'torrent.add_tags': {req: TagsParams; res: void};
  'torrent.remove_tags': {req: TagsParams; res: void};
  'torrent.add_tracker': {req: AddTrackerParams; res: void};
  'torrent.remove_tracker': {req: RemoveTrackerParams; res: void};
  'torrent.replace_trackers': {req: ReplaceTrackersParams; res: void};
  'torrent.set_file_priority': {req: SetFilePriorityParams; res: void};
  'torrent.set_download_limit': {req: SpeedLimitParams; res: void};
  'torrent.set_upload_limit': {req: SpeedLimitParams; res: void};
  'torrent.custom.set': {req: SetCustomParams; res: void};
  'torrent.custom.update': {req: UpdateCustomParams; res: void};
  'torrent.custom.del': {req: DelCustomParams; res: void};
  'client.set_download_limit': {req: GlobalSpeedLimitParams; res: void};
  'client.set_upload_limit': {req: GlobalSpeedLimitParams; res: void};
}

export type NeptuneMethod = keyof NeptuneMethodMap;

// ── Errors ───────────────────────────────────────────────────────────

export class NeptuneRPCError extends Error {
  code: number;
  data?: string;

  constructor(code: number, message: string, data?: string) {
    super(message);
    this.name = 'NeptuneRPCError';
    this.code = code;
    this.data = data;
  }
}

// ── Client ───────────────────────────────────────────────────────────

export class NeptuneClient {
  private http: AxiosInstance;
  private id = 0;

  constructor(baseUrl: string, token: string) {
    this.http = axios.create({
      baseURL: baseUrl,
      headers: {Authorization: token},
    });
  }

  async call<M extends NeptuneMethod>(
    method: M,
    params?: NeptuneMethodMap[M]['req'],
  ): Promise<NeptuneMethodMap[M]['res']> {
    const request = {
      jsonrpc: '2.0' as const,
      method,
      params: params ?? {},
      id: ++this.id,
    };

    const response = await this.http.post<{
      jsonrpc: '2.0';
      result?: NeptuneMethodMap[M]['res'];
      error?: {code: number; message: string; data?: string};
      id: number;
    }>('/json_rpc', request);

    if (response.data.error) {
      const {code, message, data} = response.data.error;
      throw new NeptuneRPCError(code, message, data);
    }

    return response.data.result as NeptuneMethodMap[M]['res'];
  }
}
