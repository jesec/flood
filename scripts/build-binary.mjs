/**
 * build single executable binary with Node.js SEA
 */

import * as os from 'node:os';
import * as fs from 'node:fs';
import * as path from 'node:path/posix';
import {execSync} from 'node:child_process';

async function main() {
  const [major] = process.versions.node.split('.').map(Number);
  if (major <= 20) {
    console.error('need node20 to run this scripts');
    return;
  }

  let binaryName = `flood-${os.platform()}-${os.arch()}`;
  if (os.platform() == 'win32') {
    binaryName += '.exe';
  }

  fs.mkdirSync('dist-pkg', {recursive: true});
  const data = JSON.parse(fs.readFileSync('sea-config.tmpl.json').toString());
  const assets = {};
  for await (const p of walk('./dist/assets')) {
    assets[path.normalize(p)] = p;
  }

  if (!Object.keys(assets).length) {
    execSync('pnpm run build');
  }

  fs.writeFileSync('sea-config.json', JSON.stringify({...data, assets}));

  execSync('node --experimental-sea-config sea-config.json');
  fs.copyFileSync(process.execPath, 'dist-pkg/' + binaryName);
  execSync(
    `npx postject dist-pkg/${binaryName} NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`,
  );
}

async function* walk(dir) {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile()) yield entry;
  }
}

await main();
