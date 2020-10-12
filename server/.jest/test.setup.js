import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {spawn} from 'child_process';

const temporaryRuntimeDirectory = path.resolve(os.tmpdir(), crypto.randomBytes(12).toString('hex'));

const rTorrentSession = path.join(temporaryRuntimeDirectory, '.session');
const rTorrentSocket = path.join(temporaryRuntimeDirectory, 'rtorrent.sock');

fs.mkdirSync(rTorrentSession, {recursive: true});

const rTorrentProcess = spawn(
  'rtorrent',
  [
    '-n',
    '-d',
    temporaryRuntimeDirectory,
    '-s',
    rTorrentSession,
    '-o',
    'system.daemon.set=true',
    '-o',
    `network.scgi.open_local=${rTorrentSocket}`,
  ],
  {
    stdio: 'ignore',
    killSignal: 'SIGKILL',
  },
);

process.argv = ['node', 'flood'];
process.argv.push('--rundir', temporaryRuntimeDirectory);
process.argv.push('--noauth');
process.argv.push('--rtsocket', rTorrentSocket);

afterAll((done) => {
  rTorrentProcess.on('close', () => {
    fs.rmdirSync(temporaryRuntimeDirectory, {recursive: true});
    done();
  });

  rTorrentProcess.kill('SIGKILL');
});
