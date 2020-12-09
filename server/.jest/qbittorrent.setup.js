import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {spawn} from 'child_process';

const temporaryRuntimeDirectory = path.resolve(os.tmpdir(), `flood.test.${crypto.randomBytes(12).toString('hex')}`);

fs.mkdirSync(temporaryRuntimeDirectory, {recursive: true});

const qbtPort = Math.floor(Math.random() * (65534 - 20000) + 20000);

const qBittorrentDaemon = spawn(
  'qbittorrent-nox',
  [`--webui-port=${qbtPort}`, `--profile=${temporaryRuntimeDirectory}`],
  {
    stdio: 'ignore',
    killSignal: 'SIGKILL',
  },
);

process.argv = ['node', 'flood'];
process.argv.push('--rundir', temporaryRuntimeDirectory);
process.argv.push('--allowedpath', temporaryRuntimeDirectory);
process.argv.push('--auth', 'none');
process.argv.push('--qburl', `http://127.0.0.1:${qbtPort}`);
process.argv.push('--qbuser', 'admin');
process.argv.push('--qbpass', 'adminadmin');
process.argv.push('--assets', 'false');

afterAll(() => {
  qBittorrentDaemon.kill('SIGKILL');
  fs.rmdirSync(temporaryRuntimeDirectory, {recursive: true});
});
