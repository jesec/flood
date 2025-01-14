import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

const temporaryRuntimeDirectory = path.resolve(os.tmpdir(), `flood.test.${crypto.randomBytes(12).toString('hex')}`);

const rTorrentSession = path.join(temporaryRuntimeDirectory, '.session');
const rTorrentSocket = path.join(temporaryRuntimeDirectory, 'rtorrent.sock');

fs.mkdirSync(rTorrentSession, {recursive: true});

fs.writeFileSync(
  `${temporaryRuntimeDirectory}/rtorrent.rc`,
  `
directory.default.set = "${temporaryRuntimeDirectory}"
session.path.set = "${rTorrentSession}"
network.scgi.open_local = "${rTorrentSocket}"
`,
);

process.argv = ['node', 'flood'];
process.argv.push('--rundir', temporaryRuntimeDirectory);
process.argv.push('--auth', 'none');
process.argv.push('--rtsocket', rTorrentSocket);
process.argv.push('--allowedpath', temporaryRuntimeDirectory);
process.argv.push('--rtorrent');
process.argv.push('--rtconfig', `${temporaryRuntimeDirectory}/rtorrent.rc`);
process.argv.push('--test');
process.argv.push('--assets', 'false');

afterAll((done) => {
  if (fs.existsSync(`${temporaryRuntimeDirectory}/rtorrent.pid`)) {
    process.kill(Number(fs.readFileSync(`${temporaryRuntimeDirectory}/rtorrent.pid`).toString()));
  }
  if (process.env.CI !== 'true') {
    // TODO: This leads to test flakiness caused by ENOENT error
    // NeDB provides no method to close database connection
    fs.rmdirSync(temporaryRuntimeDirectory, {recursive: true});
  }
  done();
});
