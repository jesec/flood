import {NeptuneConnectionError, NeptuneHTTPError, NeptuneRPCError} from './errors.ts';
import type {
  AddTorrentParams,
  AddTorrentResult,
  AddTrackerParams,
  DelCustomParams,
  GetRecheckOnCompleteResult,
  GlobalSpeedLimitParams,
  InfoHashParams,
  ListTorrentParams,
  MoveTorrentParams,
  RemoveTorrentParams,
  RemoveTrackerParams,
  ReplaceTrackersParams,
  SetCustomParams,
  SetFilePriorityParams,
  SetRecheckOnCompleteParams,
  SpeedLimitParams,
  TagsParams,
  TorrentFiles,
  TorrentInfo,
  TorrentList,
  TorrentPeers,
  TorrentTrackers,
  TransferConfig,
  TransferSummary,
  UpdateCustomParams,
} from './types.ts';

// ── JSON-RPC wire types ─────────────────────────────────────────────

interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: unknown;
  id: number;
}

interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  result?: T;
  error?: {code: number; message: string; data?: string};
  id: number;
}

// ── Method map ───────────────────────────────────────────────────────

/**
 * Maps every Neptune JSON-RPC method name to its parameter and result types.
 * Used to provide fully type-safe `.call()` invocations.
 */
export interface NeptuneMethodMap {
  'system.ping': {params: Record<string, never>; result: void};
  transfer_summary: {params: Record<string, never>; result: TransferSummary};
  'torrent.list': {params: ListTorrentParams; result: TorrentList};
  'torrent.get': {params: InfoHashParams; result: TorrentInfo};
  'torrent.files': {params: InfoHashParams; result: TorrentFiles};
  'torrent.peers': {params: InfoHashParams; result: TorrentPeers};
  'torrent.trackers': {params: InfoHashParams; result: TorrentTrackers};
  'torrent.add': {params: AddTorrentParams; result: AddTorrentResult};
  'torrent.remove': {params: RemoveTorrentParams; result: void};
  'torrent.start': {params: InfoHashParams; result: void};
  'torrent.stop': {params: InfoHashParams; result: void};
  'torrent.recheck': {params: InfoHashParams; result: void};
  'torrent.move': {params: MoveTorrentParams; result: void};
  'torrent.add_tags': {params: TagsParams; result: void};
  'torrent.remove_tags': {params: TagsParams; result: void};
  'torrent.add_tracker': {params: AddTrackerParams; result: void};
  'torrent.remove_tracker': {params: RemoveTrackerParams; result: void};
  'torrent.replace_trackers': {params: ReplaceTrackersParams; result: void};
  'torrent.reannounce': {params: InfoHashParams; result: void};
  'torrent.set_file_priority': {params: SetFilePriorityParams; result: void};
  'torrent.set_download_limit': {params: SpeedLimitParams; result: void};
  'torrent.set_upload_limit': {params: SpeedLimitParams; result: void};
  'torrent.custom.set': {params: SetCustomParams; result: void};
  'torrent.custom.update': {params: UpdateCustomParams; result: void};
  'torrent.custom.del': {params: DelCustomParams; result: void};
  'client.set_download_limit': {params: GlobalSpeedLimitParams; result: void};
  'client.set_upload_limit': {params: GlobalSpeedLimitParams; result: void};
  'client.get_transfer_config': {params: Record<string, never>; result: TransferConfig};
  'client.set_recheck_on_complete': {params: SetRecheckOnCompleteParams; result: void};
  'client.get_recheck_on_complete': {params: Record<string, never>; result: GetRecheckOnCompleteResult};
}

/** Union of all method name strings. */
export type NeptuneMethod = keyof NeptuneMethodMap;

// ── Client options ───────────────────────────────────────────────────

export interface NeptuneClientOptions {
  /** Base URL of the Neptune HTTP server (e.g. `http://127.0.0.1:8002`). */
  baseUrl: string;
  /** Secret token for the `Authorization` header. */
  token: string;
  /**
   * Custom `fetch` implementation (useful for testing or proxy support).
   * Defaults to the global `fetch`.
   */
  fetch?: typeof fetch;
}

// ── Client ───────────────────────────────────────────────────────────

/**
 * Type-safe JSON-RPC 2.0 client for the Neptune headless BitTorrent client.
 *
 * @example
 * ```ts
 * import { NeptuneClient } from '@neptune/sdk';
 *
 * const client = new NeptuneClient({
 *   baseUrl: 'http://127.0.0.1:8002',
 *   token: 'your-secret-token',
 * });
 *
 * // Ping the server
 * await client.call('system.ping');
 *
 * // List all torrents
 * const { torrents } = await client.call('torrent.list');
 *
 * // Add a torrent (base64-encoded .torrent file)
 * const { info_hash } = await client.call('torrent.add', {
 *   torrent_file: base64Content,
 *   tags: ['linux-iso'],
 * });
 *
 * // Set global download limit to 10 MiB/s
 * await client.call('client.set_download_limit', { limit: 10 * 1024 * 1024 });
 * ```
 */
export class NeptuneClient {
  readonly #baseUrl: string;
  readonly #token: string;
  readonly #fetch: typeof fetch;
  #id = 0;

  constructor(options: NeptuneClientOptions) {
    // Strip trailing slash for consistent URL joining.
    this.#baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.#token = options.token;
    this.#fetch = options.fetch ?? globalThis.fetch;
  }

  /**
   * Invoke a typed Neptune JSON-RPC method.
   *
   * @param method  – the method name (e.g. `'torrent.list'`).
   * @param params  – method parameters (optional when the method takes none).
   * @returns The parsed result.
   * @throws {NeptuneConnectionError} when a low-level connection failure occurs.
   * @throws {NeptuneHTTPError} when the server returns a non-2xx HTTP status.
   * @throws {NeptuneRPCError} when the server returns a JSON-RPC error.
   */
  async call<M extends NeptuneMethod>(
    method: M,
    ...args: {} extends NeptuneMethodMap[M]['params']
      ? [params?: NeptuneMethodMap[M]['params']]
      : [params: NeptuneMethodMap[M]['params']]
  ): Promise<NeptuneMethodMap[M]['result']> {
    const params = args[0] ?? {};

    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: ++this.#id,
    };

    let response: Response;
    try {
      response = await this.#fetch(`${this.#baseUrl}/json_rpc`, {
        method: 'POST',
        headers: {
          Authorization: this.#token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
    } catch (err) {
      throw new NeptuneConnectionError(`Failed to reach Neptune at ${this.#baseUrl}: ${String(err)}`, err);
    }

    if (!response.ok) {
      throw new NeptuneHTTPError(`Neptune returned HTTP ${response.status} ${response.statusText}`, response.status);
    }

    const body = (await response.json()) as JsonRpcResponse<NeptuneMethodMap[M]['result']>;

    if (body.error) {
      throw new NeptuneRPCError(body.error.code, body.error.message, body.error.data);
    }

    // "result" is absent for void-returning methods (or null on the wire).
    return body.result as NeptuneMethodMap[M]['result'];
  }
}
