import path from 'node:path';

import type {AddTorrentByFileOptions} from '@shared/schema/api/torrents';
import type {UserInDatabase} from '@shared/schema/Auth';
import type {RstorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import type {TransferSummary} from '@shared/types/TransferData';
import bencode from 'bencode';

import RTorrentClientGatewayService, {
  type AvailableMethodCalls,
  buildAvailableMethodCalls,
  EMPTY_METHOD_CALLS,
} from '../rTorrent/clientGatewayService';
import RstorrentClientRequestManager from './clientRequestManager';
import RstorrentConnectionManager from './connectionManager';
import type {SessionStatsResponse} from './proto/rstorrent';
import RstorrentStreamManager from './streamManager';
import {statsToTransferSummary} from './util/stats';

const STATS_STALE_MS = 5000;

const isMultiFileTorrent = (file: Buffer): boolean => {
  try {
    const parsed = bencode.decode(file) as {info?: {files?: unknown}};
    return Array.isArray(parsed.info?.files);
  } catch {
    return false;
  }
};

/**
 * Dedicated rstorrent connector.
 *
 * rstorrent speaks the same rTorrent command DSL, so the rTorrent gateway's
 * normalization/config layer is reused, but the transport is the native gRPC
 * API (crates/rt-grpc) instead of SCGI/XML-RPC: typed capability discovery,
 * CommandService.Execute/Multicall for DSL calls and server-streaming for
 * events/stats.
 */
export default class RstorrentClientGatewayService extends RTorrentClientGatewayService {
  private connection: RstorrentConnectionManager;
  private requestManager: RstorrentClientRequestManager;
  private streams: RstorrentStreamManager;
  private lastStats?: {stats: SessionStatsResponse; receivedAt: number};

  constructor(
    user: UserInDatabase,
    availableMethodCalls: AvailableMethodCalls,
    connection: RstorrentConnectionManager,
    requestManager: RstorrentClientRequestManager,
  ) {
    super(user, availableMethodCalls, requestManager);
    this.connection = connection;
    this.requestManager = requestManager;
    this.streams = new RstorrentStreamManager(connection, {
      onTorrentEvent: () => this.emit('PUSH_TORRENT_UPDATE'),
      onStats: (stats) => {
        this.lastStats = {stats, receivedAt: Date.now()};
      },
      onStreamsLost: () => this.emit('PUSH_TORRENT_UPDATE'),
    });
  }

  static override async create(user: UserInDatabase): Promise<RstorrentClientGatewayService> {
    const connection = new RstorrentConnectionManager(user.client as RstorrentConnectionSettings);
    const requestManager = new RstorrentClientRequestManager(connection);

    let availableMethodCalls: AvailableMethodCalls = EMPTY_METHOD_CALLS;

    try {
      await connection.verifyConnection();
      availableMethodCalls = buildAvailableMethodCalls(await requestManager.listCommands());
    } catch {
      // Keep empty capabilities; the retry timer re-runs testGateway().
    }

    connection.startConnectivityWatch();

    const service = new RstorrentClientGatewayService(user, availableMethodCalls, connection, requestManager);
    service.streams.start();

    return service;
  }

  /**
   * rstorrent does not hash existing data on load (unlike rTorrent), so a
   * newly added torrent with pre-existing files would report 0% complete.
   */
  protected override getExtraAddTorrentCalls(): string[] {
    return ['d.check_hash='];
  }

  /**
   * rstorrent keeps multi-file paths relative to the download root including
   * the torrent's base directory, while rTorrent's `d.directory_base` points at
   * the base directory itself. For multi-file torrents added with isBasePath,
   * the root must therefore be the parent directory.
   */
  protected override getAddTorrentCalls(
    file: Buffer,
    options: Required<
      Pick<AddTorrentByFileOptions, 'destination' | 'isBasePath' | 'isSequential' | 'isInitialSeeding' | 'tags'>
    >,
  ): string[] {
    const calls = super.getAddTorrentCalls(file, options);

    if (!options.isBasePath || !isMultiFileTorrent(file)) {
      return calls;
    }

    const root = path.dirname(options.destination);

    return calls.map((call) => (call.startsWith('d.directory_base.set=') ? `d.directory_base.set="${root}"` : call));
  }

  protected override normalizeTorrentHash(hash: string): string {
    // rstorrent reports lowercase hex hashes; Flood expects uppercase.
    return hash.toUpperCase();
  }

  /**
   * rstorrent does not expose throttle.global_*.{rate,total}; the transfer
   * summary comes from SystemService.StreamStats (cached) with a unary
   * GetSessionStats fallback.
   */
  override async fetchTransferSummary(): Promise<TransferSummary> {
    if (this.lastStats != null && Date.now() - this.lastStats.receivedAt < STATS_STALE_MS) {
      return statsToTransferSummary(this.lastStats.stats);
    }

    try {
      const stats = await this.connection.getSessionStats();
      this.lastStats = {stats, receivedAt: Date.now()};
      return statsToTransferSummary(stats);
    } catch {
      return this.lastStats != null
        ? statsToTransferSummary(this.lastStats.stats)
        : {downRate: 0, upRate: 0, downTotal: 0, upTotal: 0};
    }
  }

  override async testGateway(): Promise<void> {
    this.availableMethodCalls = await this.connection
      .verifyConnection()
      .then(async () => buildAvailableMethodCalls(await this.requestManager.listCommands()))
      .then(this.processClientRequestSuccess, this.processRTorrentRequestError);
  }

  override async destroy(drop: boolean): Promise<void> {
    this.streams.stop();
    this.connection.close();
    await super.destroy(drop);
  }
}
