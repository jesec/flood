import {describe, expect, it} from 'vitest';

import {clientConnectionSettingsSchema, type RstorrentConnectionSettings} from './ClientConnectionSettings';

const rstorrentTCP = {
  client: 'rstorrent',
  type: 'grpc',
  version: 1,
  host: '127.0.0.1',
  port: 50051,
} as const;

const rstorrentSocket = {
  client: 'rstorrent',
  type: 'grpcSocket',
  version: 1,
  socket: '/run/user/1000/rstorrent/grpc.sock',
} as const;

const rtorrentSocket = {
  client: 'rTorrent',
  type: 'socket',
  version: 1,
  socket: '/run/user/1000/rtorrent/scgi.sock',
} as const;

const rtorrentTCP = {
  client: 'rTorrent',
  type: 'tcp',
  version: 1,
  host: '127.0.0.1',
  port: 5000,
} as const;

describe('rstorrent connection settings', () => {
  it.each([rstorrentTCP, rstorrentSocket, rtorrentSocket, rtorrentTCP])('accepts %o', (settings) => {
    expect(clientConnectionSettingsSchema.safeParse(settings).success).toBe(true);
  });

  it('rejects gRPC settings without a port', () => {
    const rest: Record<string, unknown> = {...rstorrentTCP};
    delete rest.port;
    expect(clientConnectionSettingsSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects gRPC socket settings carrying TCP fields', () => {
    expect(clientConnectionSettingsSchema.safeParse({...rstorrentSocket, host: '127.0.0.1'}).success).toBe(false);
  });

  it('rejects gRPC settings masquerading as an rTorrent (SCGI) connection', () => {
    expect(clientConnectionSettingsSchema.safeParse({...rstorrentTCP, client: 'rTorrent'}).success).toBe(false);
    expect(clientConnectionSettingsSchema.safeParse({...rtorrentTCP, type: 'grpc'}).success).toBe(false);
  });

  it('keeps both rstorrent variants distinct', () => {
    const settings: Array<RstorrentConnectionSettings> = [rstorrentTCP, rstorrentSocket];
    expect(settings.map((entry) => entry.type)).toEqual(['grpc', 'grpcSocket']);
  });
});
