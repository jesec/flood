import * as zlib from 'node:zlib';

import {Reader} from '@maxmind/geoip2-node';

import * as data from '../geoip/data.mjs';

const r = Reader.openBuffer(zlib.brotliDecompressSync(Buffer.from(data.data, 'base64')));

export function lookup(s: string): string {
  try {
    return r.country(s)?.country?.isoCode ?? '';
  } catch {
    return '';
  }
}
