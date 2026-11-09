import {describe, expect, it} from 'vitest';

import {DELUGE_RPC_PROTOCOL_VERSION, DelugeRpcFrameDecoder} from './rpcFrameDecoder';

const frame = (payload: string): Buffer => {
  const body = Buffer.from(payload);
  const header = Buffer.alloc(5);
  header[0] = DELUGE_RPC_PROTOCOL_VERSION;
  header.writeUInt32BE(body.length, 1);
  return Buffer.concat([header, body]);
};

const asStrings = (payloads: Buffer[]): string[] => payloads.map((payload) => payload.toString());

describe('DelugeRpcFrameDecoder', () => {
  it('decodes a single frame delivered in one chunk', () => {
    const decoder = new DelugeRpcFrameDecoder();
    expect(asStrings(decoder.push(frame('hello')))).toEqual(['hello']);
  });

  it('decodes several frames delivered in one chunk', () => {
    const decoder = new DelugeRpcFrameDecoder();
    const chunk = Buffer.concat([frame('first'), frame('second'), frame('third')]);
    expect(asStrings(decoder.push(chunk))).toEqual(['first', 'second', 'third']);
  });

  it('keeps the start of the next frame when a chunk ends mid-frame', () => {
    const decoder = new DelugeRpcFrameDecoder();
    const stream = Buffer.concat([frame('first'), frame('second')]);
    const cut = frame('first').length + 7; // inside the second frame's payload

    expect(asStrings(decoder.push(stream.subarray(0, cut)))).toEqual(['first']);
    expect(asStrings(decoder.push(stream.subarray(cut)))).toEqual(['second']);
  });

  it('handles a header split across chunks', () => {
    const decoder = new DelugeRpcFrameDecoder();
    const bytes = frame('split header');

    expect(decoder.push(bytes.subarray(0, 3))).toEqual([]);
    expect(asStrings(decoder.push(bytes.subarray(3)))).toEqual(['split header']);
  });

  it('handles a stream delivered one byte at a time', () => {
    const decoder = new DelugeRpcFrameDecoder();
    const stream = Buffer.concat([frame('a'), frame(''), frame('bc')]);

    const payloads: Buffer[] = [];
    for (const byte of stream) {
      payloads.push(...decoder.push(Buffer.from([byte])));
    }

    expect(asStrings(payloads)).toEqual(['a', '', 'bc']);
  });

  it('throws on an unexpected protocol version', () => {
    const decoder = new DelugeRpcFrameDecoder();
    const bytes = frame('bad');
    bytes[0] = 0x02;

    expect(() => decoder.push(bytes)).toThrow('Unexpected Deluge RPC version.');
  });
});
