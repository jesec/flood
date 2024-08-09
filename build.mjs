/**
 * build single executable binary with Node.js SEA
 */

import * as fs from 'node:fs';
import {execSync} from 'node:child_process';

execSync('npm run build');
execSync('node --experimental-sea-config sea-config.json');

fs.copyFileSync(process.execPath, 'flood.exe');

execSync(
  'npx postject flood.exe NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
);
