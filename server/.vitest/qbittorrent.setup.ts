import {spawn} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const temporaryRuntimeDirectory = path.resolve(os.tmpdir(), `flood.test.${crypto.randomBytes(12).toString('hex')}`);

export default async () => {
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

  process.argv = [
    'node',
    'flood',
    '--rundir',
    temporaryRuntimeDirectory,
    '--allowedpath',
    temporaryRuntimeDirectory,
    '--auth',
    'none',
    '--qburl',
    `http://127.0.0.1:${qbtPort}`,
    '--qbuser',
    'admin',
    '--qbpass',
    'adminadmin',
    '--assets',
    'false',
  ];

  return async () => {
    qBittorrentDaemon.kill('SIGKILL');

    await new Promise((resolve) => {
      qBittorrentDaemon.on('close', resolve);
    });

    fs.rmSync(temporaryRuntimeDirectory, {recursive: true, force: true});
  };
};
