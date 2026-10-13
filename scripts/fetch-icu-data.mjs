import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import unzipper from 'unzipper';

// The prebuilt executables bundle a small-icu Node.js, whose Intl.Segmenter needs this data file.
// ICU_DATA_VERSION has to match process.versions.icu of the Node.js bundled in the pkg base
// binaries, which the executables are built from.
const ICU_DATA_VERSION = '78.2';
const ICU_DATA_SHA256 = '6fc51a8818242bfd83207ab89551166ac2fb4bf502d01e41cddc8cb6a0ba4cda';

const dataFileName = `icudt${ICU_DATA_VERSION.split('.')[0]}l.dat`;

const outDir = process.argv[2];
if (!outDir) {
  console.error('usage: node scripts/fetch-icu-data.mjs OUTPUT_DIR');
  process.exit(1);
}

const url = `https://github.com/unicode-org/icu/releases/download/release-${ICU_DATA_VERSION}/icu4c-${ICU_DATA_VERSION}-data-bin-l.zip`;

const response = await fetch(url);
if (!response.ok) {
  throw new Error(`${url} responded with ${response.status}`);
}
const archive = Buffer.from(await response.arrayBuffer());

const sha256 = crypto.createHash('sha256').update(archive).digest('hex');
if (sha256 !== ICU_DATA_SHA256) {
  throw new Error(`${url} hashes to ${sha256}, expected ${ICU_DATA_SHA256}`);
}

const directory = await unzipper.Open.buffer(archive);
const readEntry = async (name) => {
  const entry = directory.files.find((file) => file.path === name);
  if (!entry) {
    throw new Error(`${url} contains no ${name}`);
  }
  return entry.buffer();
};

fs.mkdirSync(outDir, {recursive: true});
fs.writeFileSync(path.join(outDir, dataFileName), await readEntry(dataFileName));
fs.writeFileSync(path.join(outDir, `${dataFileName}.LICENSE`), await readEntry('LICENSE'));
