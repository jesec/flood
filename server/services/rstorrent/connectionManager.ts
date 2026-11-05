import {EventEmitter} from 'node:events';

import {type ChannelOptions, Client, connectivityState} from '@grpc/grpc-js';
import type {RstorrentConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import type TypedEmitter from 'typed-emitter';
import type {EventMap} from 'typed-emitter';

import {createChannelCredentials, createChannelTarget, GRPC_CHANNEL_OPTIONS} from './channelFactory';
import {getDeadline} from './grpcCall';
import {
  type CommandRequest,
  type CommandResponse,
  CommandServiceService,
  type Empty,
  type ListCommandsResponse,
  type MulticallRequest,
  type MulticallResponse,
  type SessionStatsResponse,
  type StreamEventsRequest,
  type StreamStatsRequest,
  SystemServiceService,
  type TorrentEvent,
  TorrentServiceService,
  type VersionResponse,
} from './proto/rstorrent';
import {makeServerStreamCaller, makeUnaryCaller, type ServerStreamCaller, type UnaryCaller} from './serviceClients';

const VERIFY_TIMEOUT_MS = 10_000;
const WATCH_TIMEOUT_MS = 60_000;

type ConnectionManagerEvents = {
  ready: () => void;
  drop: (reason: unknown) => void;
};

/**
 * Owns the gRPC channel and the service clients built on top of it.
 *
 * gRPC reconnects internally; this manager only reports state transitions so
 * the streams layer can resubscribe and the gateway can drive the connection
 * status UI.
 */
class RstorrentConnectionManager extends (EventEmitter as {
  new <T extends EventMap>(): TypedEmitter<T>;
})<ConnectionManagerEvents> {
  readonly settings: RstorrentConnectionSettings;
  readonly client: Client;

  readonly torrentClient: {
    streamEvents: ServerStreamCaller<StreamEventsRequest, TorrentEvent>;
  };

  readonly systemClient: {
    getVersion: UnaryCaller<Empty, VersionResponse>;
    getSessionStats: UnaryCaller<Empty, SessionStatsResponse>;
    streamStats: ServerStreamCaller<StreamStatsRequest, SessionStatsResponse>;
  };

  readonly commandClient: {
    execute: UnaryCaller<CommandRequest, CommandResponse>;
    multicall: UnaryCaller<MulticallRequest, MulticallResponse>;
    listCommands: UnaryCaller<Empty, ListCommandsResponse>;
  };

  private closed = false;
  private lastReady: boolean | null = null;
  private watching = false;

  constructor(settings: RstorrentConnectionSettings, options: ChannelOptions = GRPC_CHANNEL_OPTIONS) {
    super();
    this.settings = settings;
    this.client = new Client(createChannelTarget(settings), createChannelCredentials(), options);

    this.torrentClient = {
      streamEvents: makeServerStreamCaller<StreamEventsRequest, TorrentEvent>(
        this.client,
        TorrentServiceService.streamEvents,
      ),
    };

    this.systemClient = {
      getVersion: makeUnaryCaller<Empty, VersionResponse>(this.client, SystemServiceService.getVersion),
      getSessionStats: makeUnaryCaller<Empty, SessionStatsResponse>(this.client, SystemServiceService.getSessionStats),
      streamStats: makeServerStreamCaller<StreamStatsRequest, SessionStatsResponse>(
        this.client,
        SystemServiceService.streamStats,
      ),
    };

    this.commandClient = {
      execute: makeUnaryCaller<CommandRequest, CommandResponse>(this.client, CommandServiceService.execute),
      multicall: makeUnaryCaller<MulticallRequest, MulticallResponse>(this.client, CommandServiceService.multicall),
      listCommands: makeUnaryCaller<Empty, ListCommandsResponse>(this.client, CommandServiceService.listCommands),
    };
  }

  get isClosed(): boolean {
    return this.closed;
  }

  /** Handshake: throws if the daemon is unreachable or is not an rt-grpc server. */
  async verifyConnection(): Promise<VersionResponse> {
    return this.systemClient.getVersion({}, {deadline: getDeadline(VERIFY_TIMEOUT_MS)});
  }

  /** Unary session stats, used while the stats stream is not available. */
  async getSessionStats(): Promise<SessionStatsResponse> {
    return this.systemClient.getSessionStats({}, {deadline: getDeadline()});
  }

  startConnectivityWatch(): void {
    if (this.closed || this.watching) {
      return;
    }

    this.watching = true;

    const tick = (): void => {
      if (this.closed) {
        return;
      }

      const state = this.client.getChannel().getConnectivityState(true);
      this.handleState(state);

      this.client.getChannel().watchConnectivityState(state, Date.now() + WATCH_TIMEOUT_MS, (error) => {
        if (this.closed) {
          return;
        }

        // `error` is usually just a timeout (re-watch, the channel triggers
        // state changes itself). Real failures surface through the state.
        const code = (error as {code?: number} | null)?.code;
        if (error != null && code !== 4 /* DEADLINE_EXCEEDED */) {
          this.emitDrop(error);
        }

        tick();
      });
    };

    tick();
  }

  close(): void {
    if (this.closed) {
      return;
    }

    this.closed = true;
    this.watching = false;
    this.client.close();
    this.removeAllListeners();
  }

  private handleState(state: connectivityState): void {
    const isReady = state === connectivityState.READY;

    if (isReady === this.lastReady) {
      return;
    }

    this.lastReady = isReady;

    if (isReady) {
      this.emit('ready');
    } else if (state === connectivityState.TRANSIENT_FAILURE) {
      this.emitDrop(state);
    }
  }

  private emitDrop(reason: unknown): void {
    if (!this.closed) {
      this.emit('drop', reason);
    }
  }
}

export default RstorrentConnectionManager;
