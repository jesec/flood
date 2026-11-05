import path from 'node:path';

import {describe, expect, it} from 'vitest';

import RstorrentConnectionManager from './connectionManager';
import type {SessionStatsResponse, TorrentEvent} from './proto/rstorrent';
import RstorrentStreamManager from './streamManager';
import MockGRPCServer from './testing/mockGRPCServer';

const socketPath = (name: string): string =>
  path.join('/tmp/opencode', `flood-grpc-stream-${process.pid}-${name}.sock`);

const stats = (downRate: string): SessionStatsResponse => ({
  upRateBytesPerSec: 1n,
  downRateBytesPerSec: BigInt(downRate),
  upTotalBytes: 2n,
  downTotalBytes: 3n,
  activeTorrents: 1,
  totalTorrents: 1,
  listenPort: 0,
  throttleUpLimit: 0n,
  throttleDownLimit: 0n,
  dhtActive: false,
  dhtNodes: 0,
  dhtTorrents: 0,
  dhtPort: 0,
});

const event = (name: string): TorrentEvent => ({
  eventName: name,
  hash: '420E0CA91FA830FF074ED9B0F681AD4EB4FBA6FD',
  summary: undefined,
  timestamp: 1n,
});

describe('RstorrentStreamManager', () => {
  it.runIf(process.platform !== 'win32')(
    'streams events and stats and resubscribes after a restart',
    async () => {
      const socket = socketPath('resubscribe');
      const first = await MockGRPCServer.startUnix(socket);
      const connection = new RstorrentConnectionManager({
        client: 'rstorrent',
        type: 'grpcSocket',
        version: 1,
        socket,
      });

      const receivedEvents: TorrentEvent[] = [];
      const receivedStats: SessionStatsResponse[] = [];
      let streamsLost = 0;

      const streams = new RstorrentStreamManager(connection, {
        onTorrentEvent: (received) => receivedEvents.push(received),
        onStats: (received) => receivedStats.push(received),
        onStreamsLost: () => {
          streamsLost += 1;
        },
      });

      let second: MockGRPCServer | undefined;

      try {
        await connection.verifyConnection();
        connection.startConnectivityWatch();
        streams.start();

        await expect.poll(() => first.mock.streamCount, {timeout: 5000}).toBe(2);

        first.mock.emitEvent(event('event.download.inserted'));
        first.mock.pushStats(stats('100'));

        await expect.poll(() => receivedEvents.length, {timeout: 5000}).toBe(1);
        await expect.poll(() => receivedStats.length, {timeout: 5000}).toBe(1);
        expect(receivedStats[0].downRateBytesPerSec).toBe(100n);

        // Kill the daemon: the manager must reconnect and resubscribe.
        await first.mock.stop();
        second = (await MockGRPCServer.startUnix(socket)).mock;

        await expect.poll(() => second?.streamCount ?? 0, {timeout: 20_000}).toBe(2);
        expect(streamsLost).toBeGreaterThan(0);

        second.emitEvent(event('event.download.finished'));
        await expect.poll(() => receivedEvents.length, {timeout: 5000}).toBe(2);
      } finally {
        streams.stop();
        connection.close();
        await second?.stop();
      }
    },
    30_000,
  );

  it.runIf(process.platform !== 'win32')('stops both subscriptions', async () => {
    const socket = socketPath('stop');
    const {mock} = await MockGRPCServer.startUnix(socket);
    const connection = new RstorrentConnectionManager({
      client: 'rstorrent',
      type: 'grpcSocket',
      version: 1,
      socket,
    });
    const streams = new RstorrentStreamManager(connection, {
      onTorrentEvent: () => undefined,
      onStats: () => undefined,
      onStreamsLost: () => undefined,
    });

    try {
      await connection.verifyConnection();
      connection.startConnectivityWatch();
      streams.start();
      await expect.poll(() => mock.streamCount, {timeout: 5000}).toBe(2);

      streams.stop();
      await expect.poll(() => mock.streamCount, {timeout: 5000}).toBe(0);
    } finally {
      streams.stop();
      connection.close();
      await mock.stop();
    }
  });
});
