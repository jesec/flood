import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

export const PROTO_PATH = fileURLToPath(new URL('../proto/rstorrent.proto', import.meta.url));

type AnyMessage = Record<string, unknown>;
type ServerStreamingCall = grpc.ServerWritableStream<AnyMessage, AnyMessage>;
type UnaryCall = grpc.ServerUnaryCall<AnyMessage, AnyMessage>;
type UnaryCallback = grpc.sendUnaryData<AnyMessage>;

export interface MockGRPCHandlers {
  execute?: (request: AnyMessage) => AnyMessage | Promise<AnyMessage>;
  multicall?: (request: AnyMessage) => AnyMessage | Promise<AnyMessage>;
  listCommands?: () => string[];
  listTorrents?: (request: AnyMessage) => AnyMessage;
  getTorrent?: (request: AnyMessage) => AnyMessage;
  addTorrent?: (request: AnyMessage) => AnyMessage;
  controlTorrent?: (request: AnyMessage) => AnyMessage;
  removeTorrent?: (request: AnyMessage) => AnyMessage;
  setTorrentPriority?: (request: AnyMessage) => AnyMessage;
  getSessionStats?: () => AnyMessage;
  getVersion?: () => AnyMessage;
}

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDefinition) as unknown as {
  rtorrent: {
    v1: {
      TorrentService: {service: grpc.ServiceDefinition};
      SystemService: {service: grpc.ServiceDefinition};
      CommandService: {service: grpc.ServiceDefinition};
    };
  };
};

const {TorrentService, SystemService, CommandService} = grpcObject.rtorrent.v1;

const DEFAULT_VERSION: AnyMessage = {
  version: '0.10.0',
  apiVersion: '0.10.0',
  buildTarget: 'test',
  uptimeSeconds: '1',
};

const DEFAULT_STATS: AnyMessage = {
  upRateBytesPerSec: '0',
  downRateBytesPerSec: '0',
  upTotalBytes: '0',
  downTotalBytes: '0',
  activeTorrents: 0,
  totalTorrents: 0,
  listenPort: 0,
  throttleUpLimit: '0',
  throttleDownLimit: '0',
};

/**
 * In-process rt-grpc server for unit tests. Implements the whole vendored
 * contract with harmless defaults; tests override the handlers they care about.
 */
export default class MockGRPCServer {
  readonly server = new grpc.Server();
  readonly socketPath?: string;
  handlers: MockGRPCHandlers = {};

  private eventCalls = new Set<ServerStreamingCall>();
  private statsCalls = new Set<ServerStreamingCall>();

  static async startTCP(): Promise<{mock: MockGRPCServer; address: string}> {
    const mock = new MockGRPCServer();
    const port = await mock.bind('127.0.0.1:0');
    return {mock, address: `127.0.0.1:${port}`};
  }

  static async startUnix(socketPath: string): Promise<{mock: MockGRPCServer; address: string}> {
    fs.mkdirSync(path.dirname(socketPath), {recursive: true});
    fs.rmSync(socketPath, {force: true});
    const mock = new MockGRPCServer(socketPath);
    await mock.bind(`unix:${socketPath}`);
    return {mock, address: socketPath};
  }

  private constructor(socketPath?: string) {
    this.socketPath = socketPath;
    this.server.addService(TorrentService.service, {
      listTorrents: (call: UnaryCall, callback: UnaryCallback) => {
        callback(null, this.handlers.listTorrents?.(call.request) ?? {torrents: []});
      },
      getTorrent: (call: UnaryCall, callback: UnaryCallback) => {
        if (this.handlers.getTorrent == null) {
          callback({code: grpc.status.NOT_FOUND, message: 'not found'});
          return;
        }
        callback(null, this.handlers.getTorrent(call.request));
      },
      addTorrent: (call: UnaryCall, callback: UnaryCallback) => {
        callback(
          null,
          this.handlers.addTorrent?.(call.request) ?? {
            hash: '',
            name: '',
            success: false,
            errorMessage: 'not implemented',
          },
        );
      },
      controlTorrent: (call: UnaryCall, callback: UnaryCallback) => {
        callback(
          null,
          this.handlers.controlTorrent?.(call.request) ?? {
            success: false,
            hash: String(call.request.hash),
            currentState: 'TORRENT_STATE_UNSPECIFIED',
            errorMessage: 'not implemented',
          },
        );
      },
      removeTorrent: (call: UnaryCall, callback: UnaryCallback) => {
        callback(
          null,
          this.handlers.removeTorrent?.(call.request) ?? {
            success: false,
            hash: String(call.request.hash),
            errorMessage: 'not implemented',
          },
        );
      },
      setTorrentPriority: (call: UnaryCall, callback: UnaryCallback) => {
        callback(
          null,
          this.handlers.setTorrentPriority?.(call.request) ?? {success: false, errorMessage: 'not implemented'},
        );
      },
      streamEvents: (call: ServerStreamingCall) => {
        this.eventCalls.add(call);
        call.on('cancelled', () => this.eventCalls.delete(call));
      },
    });

    this.server.addService(SystemService.service, {
      getVersion: (call: UnaryCall, callback: UnaryCallback) => {
        callback(null, this.handlers.getVersion?.() ?? DEFAULT_VERSION);
      },
      getSessionStats: (call: UnaryCall, callback: UnaryCallback) => {
        callback(null, this.handlers.getSessionStats?.() ?? DEFAULT_STATS);
      },
      streamStats: (call: ServerStreamingCall) => {
        this.statsCalls.add(call);
        call.on('cancelled', () => this.statsCalls.delete(call));
      },
      shutdown: (call: UnaryCall, callback: UnaryCallback) => {
        callback(null, {acknowledged: true, message: 'shutdown'});
      },
    });

    this.server.addService(CommandService.service, {
      execute: async (call: UnaryCall, callback: UnaryCallback) => {
        try {
          callback(
            null,
            (await this.handlers.execute?.(call.request)) ?? {success: true, result: null, errorMessage: ''},
          );
        } catch (error) {
          callback(error as grpc.ServiceError);
        }
      },
      multicall: async (call: UnaryCall, callback: UnaryCallback) => {
        try {
          callback(null, (await this.handlers.multicall?.(call.request)) ?? {results: []});
        } catch (error) {
          callback(error as grpc.ServiceError);
        }
      },
      listCommands: (call: UnaryCall, callback: UnaryCallback) => {
        callback(null, {commands: this.handlers.listCommands?.() ?? ['system.listMethods']});
      },
    });
  }

  emitEvent(event: object): void {
    for (const call of this.eventCalls) {
      call.write(event as AnyMessage);
    }
  }

  pushStats(stats: object = DEFAULT_STATS): void {
    for (const call of this.statsCalls) {
      call.write(stats as AnyMessage);
    }
  }

  get streamCount(): number {
    return this.eventCalls.size + this.statsCalls.size;
  }

  async stop(): Promise<void> {
    for (const call of this.eventCalls) {
      call.end();
    }
    for (const call of this.statsCalls) {
      call.end();
    }

    this.eventCalls.clear();
    this.statsCalls.clear();

    await new Promise<void>((resolve) => {
      this.server.tryShutdown((error) => {
        if (error) {
          this.server.forceShutdown();
        }
        resolve();
      });
    });

    if (this.socketPath != null) {
      fs.rmSync(this.socketPath, {force: true});
    }
  }

  private bind(address: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (error, port) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(port);
      });
    });
  }
}
