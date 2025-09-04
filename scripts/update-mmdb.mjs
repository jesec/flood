import * as fs from 'node:fs';
import * as zlib from 'node:zlib';

const buf = fs.readFileSync('server/geoip/GeoLite2-Country.mmdb');

const compressed = zlib.brotliCompressSync(buf).toString('base64');

fs.writeFileSync(
  'server/geoip/data.ts',
  `
import * as zlib from 'node:zlib';

// data is brotli compressed GeoLite2-Country.mmdb in base64 format
export const data = zlib.brotliDecompressSync(Buffer.from('${compressed}', 'base64'));
`,
);
