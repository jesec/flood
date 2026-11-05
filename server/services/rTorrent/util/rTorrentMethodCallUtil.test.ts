import {describe, expect, it} from 'vitest';

import {booleanTransformer, getMethodCommandName, numberTransformer, stringTransformer} from './rTorrentMethodCallUtil';

describe('booleanTransformer', () => {
  it('follows rtorrent truthiness', () => {
    expect(booleanTransformer('0')).toBe(false);
    expect(booleanTransformer(0)).toBe(false);
    expect(booleanTransformer('1')).toBe(true);
    expect(booleanTransformer(1)).toBe(true);
  });

  it('treats empty/missing values as false', () => {
    // `false=` sentinels for unavailable methods come back as empty values
    // from clients that do not implement the `false` command (rstorrent).
    expect(booleanTransformer('')).toBe(false);
    expect(booleanTransformer(undefined)).toBe(false);
    expect(booleanTransformer(null)).toBe(false);
  });
});

describe('getMethodCommandName', () => {
  it('normalizes getters and embedded expressions', () => {
    expect(getMethodCommandName('d.hash=')).toBe('d.hash');
    expect(getMethodCommandName('d.custom1=')).toBe('d.custom1');
    expect(getMethodCommandName('d.multicall2')).toBe('d.multicall2');
    expect(getMethodCommandName('cat="$t.multicall=d.hash=,t.url=,cat={|||}"')).toBe('cat');
  });
});

describe('numberTransformer', () => {
  it('coerces numeric strings and empty values', () => {
    expect(numberTransformer('42')).toBe(42);
    expect(numberTransformer(42)).toBe(42);
    expect(numberTransformer('')).toBe(0);
  });
});

describe('stringTransformer', () => {
  it('passes values through', () => {
    expect(stringTransformer('abc')).toBe('abc');
  });
});
