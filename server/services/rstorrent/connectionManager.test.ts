import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {createChannelTarget} from './channelFactory';
import RstorrentConnectionManager from './connectionManager';
import MockGRPCServer from './testing/mockGRPCServer';
import {createBackoff} from './util/backoff';

const socketPath = (name: string): string => path.join('/tmp/opencode', `flood-grpc-${process.pid}-${name}.sock`);

describe('createChannelTarget', () => {
  it('builds a tcp target', () => {
    expect(
      createChannelTarget({
        client: 'rstorrent',
        type: 'grpc',
        version: 1,
        host: '127.0.0.1',
        port: 50051,
      }),
    ).toBe('127.0.0.1:50051');
  });

  it('builds a unix socket target', () => {
    expect(
      createChannelTarget({
        client: 'rstorrent',
        type: 'grpcSocket',
        version: 1,
        socket: '/tmp/opencode/rt-grpc.sock',
      }),
    ).toBe('unix:/tmp/opencode/rt-grpc.sock');
  });
});

describe('createBackoff', () => {
  it('grows exponentially and caps out', () => {
    const backoff = createBackoff({initialMs: 1000, maxMs: 5000});

    expect([backoff.next(), backoff.next(), backoff.next(), backoff.next()]).toEqual([1000, 2000, 4000, 5000]);

    backoff.reset();
    expect(backoff.next()).toBe(1000);
  });
});

describe('RstorrentConnectionManager', () => {
  it('verifies a connection over TCP', async () => {
    const {mock, address} = await MockGRPCServer.startTCP();
    const manager = new RstorrentConnectionManager({
      client: 'rstorrent',
      type: 'grpc',
      version: 1,
      host: '127.0.0.1',
      port: Number(address.split(':')[1]),
    });

    try {
      const version = await manager.verifyConnection();
      expect(version.version).toBe('0.10.0');
      expect(version.apiVersion).toBe('0.10.0');

      const stats = await manager.getSessionStats();
      expect(Number(stats.activeTorrents)).toBe(0);
    } finally {
      manager.close();
      await mock.stop();
    }
  });

  it.runIf(process.platform !== 'win32')('verifies a connection over a unix socket', async () => {
    const socket = socketPath('verify');
    const {mock} = await MockGRPCServer.startUnix(socket);
    const manager = new RstorrentConnectionManager({
      client: 'rstorrent',
      type: 'grpcSocket',
      version: 1,
      socket,
    });

    try {
      const version = await manager.verifyConnection();
      expect(version.version).toBe('0.10.0');
    } finally {
      manager.close();
      await mock.stop();
    }
  });

  it('reports readiness when the channel connects', async () => {
    const {mock, address} = await MockGRPCServer.startTCP();
    const manager = new RstorrentConnectionManager({
      client: 'rstorrent',
      type: 'grpc',
      version: 1,
      host: '127.0.0.1',
      port: Number(address.split(':')[1]),
    });

    try {
      const ready = new Promise<void>((resolve) => {
        manager.once('ready', resolve);
      });

      manager.startConnectivityWatch();
      await manager.verifyConnection();
      await expect(ready).resolves.toBeUndefined();
    } finally {
      manager.close();
      await mock.stop();
    }
  });
});
