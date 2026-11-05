import {type ClientReadableStream, connectivityState} from '@grpc/grpc-js';

import type RstorrentConnectionManager from './connectionManager';
import type {SessionStatsResponse, TorrentEvent} from './proto/rstorrent';
import {createBackoff, sleep} from './util/backoff';

export interface RstorrentStreamHooks {
  onTorrentEvent: (event: TorrentEvent) => void;
  onStats: (stats: SessionStatsResponse) => void;
  /** Called when the events stream was interrupted and a full resync is needed. */
  onStreamsLost: () => void;
}

const DEFAULT_STATS_INTERVAL_MS = 1000;
const RETRY_INITIAL_MS = 1000;
const RETRY_MAX_MS = 30_000;

/**
 * Owns the two server-streaming subscriptions of the rstorrent API:
 * - `TorrentService.StreamEvents` (lifecycle events -> immediate UI refreshes),
 * - `SystemService.StreamStats` (global transfer rates).
 *
 * Streams are re-established on every channel `ready` transition and after
 * unexpected stream termination. The regular poller keeps running as a safety
 * net: rstorrent silently drops events when its broadcast channel lags.
 */
export default class RstorrentStreamManager {
  private started = false;
  private startedGenerations = 0;
  private generation = 0;
  private eventStream?: ClientReadableStream<TorrentEvent>;
  private statsStream?: ClientReadableStream<SessionStatsResponse>;

  constructor(
    private connection: RstorrentConnectionManager,
    private hooks: RstorrentStreamHooks,
    private statsIntervalMs: number = DEFAULT_STATS_INTERVAL_MS,
  ) {}

  start(): void {
    if (this.started || this.connection.isClosed) {
      return;
    }

    this.started = true;
    this.connection.on('ready', this.handleReady);
    this.connection.on('drop', this.handleDrop);

    if (this.connection.client.getChannel().getConnectivityState(false) === connectivityState.READY) {
      this.startGeneration();
    }
  }

  stop(): void {
    if (!this.started) {
      return;
    }

    this.started = false;
    this.connection.off('ready', this.handleReady);
    this.connection.off('drop', this.handleDrop);
    this.stopGeneration();
  }

  private handleReady = (): void => {
    if (this.started) {
      this.startGeneration();
    }
  };

  private handleDrop = (): void => {
    if (this.started) {
      this.stopGeneration();
    }
  };

  private startGeneration(): void {
    const isRestart = this.startedGenerations > 0;
    this.stopGeneration();

    const generation = this.generation + 1;
    this.generation = generation;
    this.startedGenerations += 1;

    if (isRestart) {
      // Events may have been missed while the channel was down; resync.
      this.hooks.onStreamsLost();
    }

    void this.runEvents(generation);
    void this.runStats(generation);
  }

  private stopGeneration(): void {
    this.generation += 1;
    this.cancelStream(this.eventStream);
    this.cancelStream(this.statsStream);
    this.eventStream = undefined;
    this.statsStream = undefined;
  }

  private cancelStream(stream?: ClientReadableStream<unknown>): void {
    try {
      stream?.cancel();
    } catch {
      // already ended
    }
  }

  private isCurrent(generation: number): boolean {
    return this.started && !this.connection.isClosed && generation === this.generation;
  }

  private async runEvents(generation: number): Promise<void> {
    const backoff = createBackoff({initialMs: RETRY_INITIAL_MS, maxMs: RETRY_MAX_MS});

    while (this.isCurrent(generation)) {
      try {
        const stream = this.connection.torrentClient.streamEvents({eventFilter: []});
        this.eventStream = stream;

        for await (const event of stream) {
          if (!this.isCurrent(generation)) {
            return;
          }

          this.hooks.onTorrentEvent(event);
        }
      } catch {
        // fall through to the resync/retry path
      }

      if (!this.isCurrent(generation)) {
        return;
      }

      // Event loss is possible while the stream was down; force a full refresh.
      this.hooks.onStreamsLost();
      await sleep(backoff.next());
    }
  }

  private async runStats(generation: number): Promise<void> {
    const backoff = createBackoff({initialMs: RETRY_INITIAL_MS, maxMs: RETRY_MAX_MS});

    while (this.isCurrent(generation)) {
      try {
        const stream = this.connection.systemClient.streamStats({intervalMs: this.statsIntervalMs});
        this.statsStream = stream;

        for await (const stats of stream) {
          if (!this.isCurrent(generation)) {
            return;
          }

          this.hooks.onStats(stats);
        }
      } catch {
        // fall through to the retry path
      }

      if (!this.isCurrent(generation)) {
        return;
      }

      await sleep(backoff.next());
    }
  }
}
