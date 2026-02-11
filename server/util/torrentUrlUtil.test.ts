import {describe, expect, it} from 'vitest';

import {normalizeTorrentUrl} from './torrentUrlUtil';

describe('normalizeTorrentUrl', () => {
  it('converts 40-char hex infohash to magnet', () => {
    const hash = '0123456789abcdef0123456789abcdef01234567';

    expect(normalizeTorrentUrl(hash)).toBe(`magnet:?xt=urn:btih:${hash}`);
  });

  it('accepts uppercase hex infohashes', () => {
    const hash = '0123456789ABCDEF0123456789ABCDEF01234567';

    expect(normalizeTorrentUrl(hash)).toBe(`magnet:?xt=urn:btih:${hash}`);
  });

  it('converts 32-char base32 infohash to magnet', () => {
    const hash = 'abcdefghijklmnopqrstuvwxyz234567'.toUpperCase();

    expect(normalizeTorrentUrl(hash)).toBe(`magnet:?xt=urn:btih:${hash}`);
  });

  it('trims whitespace before checking infohash', () => {
    const hash = '0123456789abcdef0123456789abcdef01234567';

    expect(normalizeTorrentUrl(`  ${hash}  `)).toBe(`magnet:?xt=urn:btih:${hash}`);
  });

  it('leaves non-infohash URLs unchanged', () => {
    const url = 'magnet:?xt=urn:btih:0123456789abcdef0123456789abcdef01234567';

    expect(normalizeTorrentUrl(url)).toBe(url);
  });
});
