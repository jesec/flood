import fs from 'node:fs';

import type {UserInDatabase} from '@shared/schema/Auth';
import bencode from 'bencode';
import {describe, expect, it} from 'vitest';

import {buildAvailableMethodCalls} from '../rTorrent/clientGatewayService';
import torrentListMethodCallConfigs from '../rTorrent/constants/methodCallConfigs/torrentList';
import RstorrentClientGatewayService from './clientGatewayService';
import RstorrentClientRequestManager from './clientRequestManager';
import RstorrentConnectionManager from './connectionManager';
import type {ObjectValue} from './proto/rstorrent';
import MockGRPCServer from './testing/mockGRPCServer';

const HASH = '420e0ca91fa830ff074ed9b0f681ad4eb4fba6fd';
const NOW_SEC = Math.floor(Date.now() / 1000);

interface ExecuteRequestLike {
  calls: Array<{command: string; args: ObjectValue[]; targetHash: string; trusted: boolean}>;
}

const makeUser = (port: number): UserInDatabase =>
  ({
    _id: 'test',
    username: 'test',
    client: {client: 'rstorrent', type: 'grpc', version: 1, host: '127.0.0.1', port},
    level: 10,
  }) as unknown as UserInDatabase;

const TORRENT_LIST_METHODS = Object.values(torrentListMethodCallConfigs).flatMap((config) => {
  const methods = Array.isArray(config.methodCall) ? config.methodCall : [config.methodCall];
  return methods.map((method) => method.split('=')[0]);
});

const COMMANDS = [
  ...new Set([
    ...TORRENT_LIST_METHODS,
    'd.multicall2',
    'f.multicall',
    'd.custom',
    'd.custom.set',
    'session.path',
    'system.listMethods',
    'load.start_throw',
  ]),
];

const TORRENT_FIELDS: Record<string, ObjectValue> = {
  'd.hash=': {stringValue: HASH},
  'd.name=': {stringValue: 'test.bin'},
  'd.state=': {intValue: 1n},
  'd.is_active=': {intValue: 1n},
  'd.is_open=': {intValue: 1n},
  'd.complete=': {intValue: 0n},
  'd.size_bytes=': {intValue: 1024n},
  'd.bytes_done=': {intValue: 512n},
  'd.directory=': {stringValue: '/downloads'},
  'd.custom1=': {stringValue: 'tag1,tag2'},
  'd.connection_seed=': {stringValue: 'seed'},
  'd.custom=addtime': {intValue: 1700000000n},
  'd.custom=flood.selected_size': {
    stringValue: JSON.stringify({selected_size: 1024, last_update_at: NOW_SEC}),
  },
};

const makeTorrent = (name: string, files: Array<{path: string[]; length: number}> | null): Buffer =>
  Buffer.from(
    bencode.encode({
      announce: 'http://tracker/test',
      info: {
        name,
        'piece length': 16384,
        pieces: Buffer.alloc(20),
        ...(files == null ? {length: 4} : {files}),
      },
    }),
  );

describe('RstorrentClientGatewayService', () => {
  it('uses the parent directory for multi-file torrents added with isBasePath', async () => {
    const {mock, address} = await MockGRPCServer.startTCP();
    const port = Number(address.split(':')[1]);
    const connection = new RstorrentConnectionManager({
      client: 'rstorrent',
      type: 'grpc',
      version: 1,
      host: '127.0.0.1',
      port,
    });
    const requestManager = new RstorrentClientRequestManager(connection);
    let capturedCalls: ExecuteRequestLike['calls'] = [];

    mock.handlers.listCommands = () => COMMANDS;
    mock.handlers.multicall = (request) => {
      capturedCalls = (request as unknown as ExecuteRequestLike).calls;
      return {results: capturedCalls.map(() => ({success: true, result: null, errorMessage: ''}))};
    };
    mock.handlers.execute = () => ({success: true, result: {nullValue: true}, errorMessage: ''});

    const gateway = new RstorrentClientGatewayService(
      makeUser(port),
      buildAvailableMethodCalls(COMMANDS),
      connection,
      requestManager,
    );

    const getLoadParams = () => {
      const call = capturedCalls.find((entry) => entry.command === 'load.start_throw');
      expect(call).toBeDefined();
      return call!.args.map((arg) => arg.stringValue ?? '').filter(Boolean);
    };

    const destination = '/tmp/opencode/flood-rstorrent-test/multi';
    fs.mkdirSync(destination, {recursive: true});

    try {
      const multi = makeTorrent('multi', [
        {path: ['a.txt'], length: 4},
        {path: ['b.txt'], length: 4},
      ]).toString('base64');

      await gateway.addTorrentsByFile({
        files: [multi],
        destination,
        tags: [],
        isBasePath: true,
        isCompleted: false,
        isSequential: false,
        isInitialSeeding: false,
        start: true,
      });

      expect(getLoadParams()).toContain('d.directory_base.set="/tmp/opencode/flood-rstorrent-test"');
      expect(getLoadParams()).toContain('d.check_hash=');

      const single = makeTorrent('single.bin', null).toString('base64');

      await gateway.addTorrentsByFile({
        files: [single],
        destination: '/tmp/opencode/flood-rstorrent-test',
        tags: [],
        isBasePath: true,
        isCompleted: false,
        isSequential: false,
        isInitialSeeding: false,
        start: true,
      });

      expect(getLoadParams()).toContain('d.directory_base.set="/tmp/opencode/flood-rstorrent-test"');
    } finally {
      fs.rmSync('/tmp/opencode/flood-rstorrent-test', {recursive: true, force: true});
      gateway.destroyTimer();
      connection.close();
      await mock.stop();
    }
  });

  it('normalizes a torrent list from CommandService responses', async () => {
    const {mock, address} = await MockGRPCServer.startTCP();
    const port = Number(address.split(':')[1]);
    const connection = new RstorrentConnectionManager({
      client: 'rstorrent',
      type: 'grpc',
      version: 1,
      host: '127.0.0.1',
      port,
    });
    const requestManager = new RstorrentClientRequestManager(connection);

    mock.handlers.listCommands = () => COMMANDS;
    mock.handlers.getSessionStats = () => ({
      upRateBytesPerSec: '10',
      downRateBytesPerSec: '20',
      upTotalBytes: '30',
      downTotalBytes: '40',
      activeTorrents: 1,
      totalTorrents: 1,
      listenPort: 0,
      throttleUpLimit: '0',
      throttleDownLimit: '0',
    });
    mock.handlers.execute = (request) => {
      if (request.command === 'd.multicall2') {
        const fields = (request.args as ObjectValue[]).slice(1).map((arg) => arg.stringValue ?? '');
        return {
          success: true,
          result: {
            listValue: {
              values: [
                {
                  listValue: {
                    values: fields.map((field) => TORRENT_FIELDS[field] ?? {nullValue: true}),
                  },
                },
              ],
            },
          },
          errorMessage: '',
        };
      }

      return {success: true, result: {nullValue: true}, errorMessage: ''};
    };

    const gateway = new RstorrentClientGatewayService(
      makeUser(port),
      buildAvailableMethodCalls(COMMANDS),
      connection,
      requestManager,
    );

    try {
      const summary = await gateway.fetchTorrentList();
      const torrent = summary.torrents[HASH.toUpperCase()];

      expect(torrent).toBeDefined();
      expect(torrent.hash).toBe(HASH.toUpperCase());
      expect(torrent.name).toBe('test.bin');
      expect(torrent.sizeBytes).toBe(1024);
      expect(torrent.bytesDone).toBe(512);
      expect(torrent.percentComplete).toBe(50);
      expect(torrent.tags).toEqual(['tag1', 'tag2']);
      expect(torrent.isSequential).toBe(false);
      expect(torrent.isInitialSeeding).toBe(false);
      expect(torrent.status).toContain('downloading');

      await expect(gateway.fetchTransferSummary()).resolves.toEqual({
        downRate: 20,
        upRate: 10,
        downTotal: 40,
        upTotal: 30,
      });
    } finally {
      gateway.destroyTimer();
      connection.close();
      await mock.stop();
    }
  });
});
