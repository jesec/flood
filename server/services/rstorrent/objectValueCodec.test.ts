import {describe, expect, it} from 'vitest';

import {fromObjectValue, toObjectValue} from './objectValueCodec';

describe('toObjectValue', () => {
  it('encodes primitives', () => {
    expect(toObjectValue('hash')).toEqual({stringValue: 'hash'});
    expect(toObjectValue(42)).toEqual({intValue: 42n});
    expect(toObjectValue(42n)).toEqual({intValue: 42n});
    expect(toObjectValue(true)).toEqual({boolValue: true});
    expect(toObjectValue(null)).toEqual({nullValue: true});
    expect(toObjectValue(undefined)).toEqual({nullValue: true});
  });

  it('encodes buffers as bytes', () => {
    const value = toObjectValue(Buffer.from('d4:infod4:name0:e', 'utf8'));
    expect(value.bytesValue).toBeInstanceOf(Buffer);
  });

  it('encodes nested lists and maps', () => {
    expect(
      toObjectValue([
        {methodName: 'd.hash=', params: ['', 'main']},
        {methodName: 'd.name=', params: []},
      ]),
    ).toEqual({
      listValue: {
        values: [
          {
            mapValue: {
              fields: {
                methodName: {stringValue: 'd.hash='},
                params: {listValue: {values: [{stringValue: ''}, {stringValue: 'main'}]}},
              },
            },
          },
          {
            mapValue: {
              fields: {
                methodName: {stringValue: 'd.name='},
                params: {listValue: {values: []}},
              },
            },
          },
        ],
      },
    });
  });

  it('encodes unsafe numbers as strings', () => {
    expect(toObjectValue(1.5)).toEqual({stringValue: '1.5'});
  });
});

describe('fromObjectValue', () => {
  it('decodes scalars', () => {
    expect(fromObjectValue({stringValue: 'abc'})).toBe('abc');
    expect(fromObjectValue({intValue: 7n})).toBe(7);
    expect(fromObjectValue({boolValue: false})).toBe(false);
    expect(fromObjectValue({nullValue: true})).toBe('');
    expect(fromObjectValue(undefined)).toBeUndefined();
  });

  it('keeps int64 values that do not fit into a JS number as bigint', () => {
    expect(fromObjectValue({intValue: 2n ** 60n})).toBe(2n ** 60n);
  });

  it('decodes bytes as utf8', () => {
    expect(fromObjectValue({bytesValue: Buffer.from('torrent', 'utf8')})).toBe('torrent');
  });

  it('decodes a d.multicall2 response into nested arrays', () => {
    const response = {
      listValue: {
        values: [
          {
            listValue: {
              values: [{stringValue: 'ABC'}, {stringValue: 'name'}, {intValue: 1024n}],
            },
          },
        ],
      },
    };

    expect(fromObjectValue(response)).toEqual([['ABC', 'name', 1024]]);
  });

  it('round-trips nested structures', () => {
    const value = ['a', 1, true, null, {nested: ['b', 2]}];
    expect(fromObjectValue(toObjectValue(value))).toEqual(['a', 1, true, '', {nested: ['b', 2]}]);
  });
});
