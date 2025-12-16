import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterAll, beforeAll, vi} from 'vitest';

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

beforeAll(() => {
  const argv = [
    'node',
    'flood',
    '--rundir',
    temporaryRuntimeDirectory,
    '--auth',
    'none',
    '--rtsocket',
    rTorrentSocket,
    '--allowedpath',
    temporaryRuntimeDirectory,
    '--rtorrent',
    '--rtconfig',
    `${temporaryRuntimeDirectory}/rtorrent.rc`,
    '--test',
    '--assets',
    'false',
  ];
  vi.stubGlobal('process', {...process, argv});
});

afterAll(() => {
  vi.unstubAllGlobals();
  if (fs.existsSync(`${temporaryRuntimeDirectory}/rtorrent.pid`)) {
    process.kill(Number(fs.readFileSync(`${temporaryRuntimeDirectory}/rtorrent.pid`).toString()));
  }
  if (process.env.CI !== 'true') {
    // TODO: This leads to test flakiness caused by ENOENT error
    // NeDB provides no method to close database connection
    fs.rmdirSync(temporaryRuntimeDirectory, {recursive: true});
  }
});
