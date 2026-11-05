import {describe, expect, it} from 'vitest';

import type {RPCError} from '../rTorrent/types/RPCError';
import RstorrentClientRequestManager, {parseTargetString} from './clientRequestManager';
import RstorrentConnectionManager from './connectionManager';
import type {ObjectValue} from './proto/rstorrent';
import MockGRPCServer from './testing/mockGRPCServer';

interface ExecuteRequest {
  command: string;
  args: ObjectValue[];
  targetHash: string;
  trusted: boolean;
}

const HASH = '420E0CA91FA830FF074ED9B0F681AD4EB4FBA6FD';

const createManager = async () => {
  const {mock, address} = await MockGRPCServer.startTCP();
  const connection = new RstorrentConnectionManager({
    client: 'rstorrent',
    type: 'grpc',
    version: 1,
    host: '127.0.0.1',
    port: Number(address.split(':')[1]),
  });
  const manager = new RstorrentClientRequestManager(connection);

  return {
    mock,
    manager,
    connection,
    async destroy() {
      connection.close();
      await mock.stop();
    },
  };
};

describe('parseTargetString', () => {
  it('follows the rstorrent target syntax', () => {
    expect(parseTargetString('')).toEqual({kind: 'none'});
    expect(parseTargetString(HASH)).toEqual({kind: 'download', hash: HASH});
    expect(parseTargetString(`${HASH}:d`)).toEqual({kind: 'download', hash: HASH});
    expect(parseTargetString(`${HASH}:f12`)).toEqual({kind: 'file', hash: HASH, index: 12});
    expect(parseTargetString(`${HASH}:t3`)).toEqual({kind: 'tracker', hash: HASH, index: 3});
  });

  it('treats non-target strings as arguments', () => {
    expect(parseTargetString('main')).toBeNull();
    expect(parseTargetString('/downloads')).toBeNull();
    expect(parseTargetString('magnet:?xt=urn:btih:abc')).toBeNull();
    expect(parseTargetString(`${HASH}:x1`)).toBeNull();
    expect(parseTargetString(`not-a-hash-${HASH}`)).toBeNull();
  });
});

describe('RstorrentClientRequestManager', () => {
  it('drops the empty target and normalizes getter names', async () => {
    const {mock, manager, destroy} = await createManager();
    const requests: ExecuteRequest[] = [];

    mock.handlers.execute = (request) => {
      requests.push(request as unknown as ExecuteRequest);
      return {
        success: true,
        result: {listValue: {values: [{stringValue: 'ABC'}, {intValue: '1024'}]}},
        errorMessage: '',
      };
    };

    try {
      const result = await manager.methodCall('d.multicall2', ['', 'main', 'd.hash=', 'd.size_bytes=']);

      expect(result).toEqual(['ABC', 1024]);
      expect(requests[0].command).toBe('d.multicall2');
      expect(requests[0].trusted).toBe(true);
      expect(requests[0].targetHash).toBe('');
      expect(requests[0].args).toEqual([
        {stringValue: 'main'},
        {stringValue: 'd.hash='},
        {stringValue: 'd.size_bytes='},
      ]);
    } finally {
      await destroy();
    }
  });

  it('moves a leading hash into the command target', async () => {
    const {mock, manager, destroy} = await createManager();
    const requests: ExecuteRequest[] = [];

    mock.handlers.execute = (request) => {
      requests.push(request as unknown as ExecuteRequest);
      return {success: true, result: {nullValue: true}, errorMessage: ''};
    };

    try {
      await manager.methodCall('d.custom1.set', [HASH.toLowerCase(), 'tag1,tag2']);
      await manager.methodCall('d.name=', [HASH.toLowerCase()]);

      expect(requests[0]).toMatchObject({
        command: 'd.custom1.set',
        targetHash: HASH.toLowerCase(),
        args: [{stringValue: 'tag1,tag2'}],
      });
      expect(requests[1]).toMatchObject({command: 'd.name', targetHash: HASH.toLowerCase(), args: []});
    } finally {
      await destroy();
    }
  });

  it('maps system.multicall onto the gRPC Multicall RPC', async () => {
    const {mock, manager, destroy} = await createManager();
    let multicallRequest: {calls: ExecuteRequest[]} | null = null;

    mock.handlers.multicall = (request) => {
      multicallRequest = request as unknown as {calls: ExecuteRequest[]};
      return {
        results: [
          {success: true, result: {stringValue: 'one'}, errorMessage: ''},
          {success: true, result: {intValue: '2'}, errorMessage: ''},
        ],
      };
    };

    try {
      const result = await manager.methodCall('system.multicall', [
        [
          {methodName: 'd.erase', params: [HASH]},
          {methodName: 'throttle.global_up.max_rate', params: ['', '1024']},
        ],
      ]);

      expect(result).toEqual(['one', 2]);
      expect(multicallRequest).not.toBeNull();
      expect(multicallRequest!.calls).toHaveLength(2);
      expect(multicallRequest!.calls[0]).toMatchObject({command: 'd.erase', targetHash: HASH, args: []});
      expect(multicallRequest!.calls[1]).toMatchObject({
        command: 'throttle.global_up.max_rate',
        targetHash: '',
        args: [{stringValue: '1024'}],
      });
    } finally {
      await destroy();
    }
  });

  it('rejects multicast entries that fault', async () => {
    const {mock, manager, destroy} = await createManager();

    mock.handlers.multicall = () => ({
      results: [{success: false, result: null, errorMessage: 'invalid method'}],
    });

    try {
      await expect(manager.methodCall('system.multicall', [[{methodName: 'nope', params: []}]])).rejects.toMatchObject({
        message: 'invalid method',
        isRPCError: true,
      });
    } finally {
      await destroy();
    }
  });

  it('turns command faults into RPC errors', async () => {
    const {mock, manager, destroy} = await createManager();

    mock.handlers.execute = () => ({success: false, result: null, errorMessage: 'invalid method'});

    try {
      await expect(manager.methodCall('system.listMethods', [])).rejects.toMatchObject({
        message: 'invalid method',
        isRPCError: true,
      });
    } finally {
      await destroy();
    }
  });

  it('keeps transport failures distinct from command faults', async () => {
    const {mock, manager, connection} = await createManager();
    mock.handlers.execute = () => ({success: true, result: null, errorMessage: ''});

    await manager.methodCall('system.listMethods', []);
    await mock.stop();

    const failure = await manager.methodCall('system.listMethods', []).catch((error: RPCError) => error);

    expect((failure as RPCError).isRPCError).toBeUndefined();
    connection.close();
  });

  it('lists commands for capability detection', async () => {
    const {mock, manager, destroy} = await createManager();

    mock.handlers.listCommands = () => ['d.hash', 'd.name', 'system.multicall'];

    try {
      await expect(manager.listCommands()).resolves.toEqual(['d.hash', 'd.name', 'system.multicall']);
    } finally {
      await destroy();
    }
  });
});
