import chalk from 'chalk';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const temporaryRuntimeDirectory = path.resolve(os.tmpdir(), `flood.test.${crypto.randomBytes(12).toString('hex')}`);

console.log(chalk.cyan(`Temporary runtime directory: ${temporaryRuntimeDirectory}\n`));

const rTorrentSession = path.join(temporaryRuntimeDirectory, '.session');
const rTorrentSocket = path.join(temporaryRuntimeDirectory, 'rtorrent.sock');

fs.mkdirSync(rTorrentSession, {recursive: true});

fs.writeFileSync(
  `${temporaryRuntimeDirectory}/rtorrent.rc`,
  `
execute.nothrow = rm,-rf,${rTorrentSession}/rtorrent.lock
directory.default.set = "${temporaryRuntimeDirectory}"
session.path.set = "${rTorrentSession}"
network.scgi.open_local = "${rTorrentSocket}"
`,
);

const argv = [
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
  ...process.argv.slice(2),
];

let floodProcess;

const startFlood = () => {
  if (floodProcess != null) {
    return;
  }

  floodProcess = spawn('npm', ['run', 'start:development:server', '--', ...argv], {
    cwd: path.join(process.cwd()),
    stdio: 'inherit',
  });
};

const closeProcesses = () => {
  floodProcess.on('close', () => {
    if (process.env.CI !== 'true') {
      // TODO: This leads to test flakiness caused by ENOENT error
      // NeDB provides no method to close database connection
      fs.rmSync(temporaryRuntimeDirectory, {recursive: true, force: true});
    }
  });

  floodProcess.kill('SIGTERM');
  process.kill(Number(fs.readFileSync(`${temporaryRuntimeDirectory}/rtorrent.pid`).toString()));
};

startFlood();

process.on('SIGINT', () => {
  process.exit();
});

process.on('exit', () => {
  closeProcesses();
});
