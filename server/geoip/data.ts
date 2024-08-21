import * as zlib from 'node:zlib';

// data is brotli compressed GeoLite2-Country.mmdb in base64 format
export const data = zlib.brotliDecompressSync(
  Buffer.from(
    'base64',
  ),
);