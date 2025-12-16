import {spawn} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterAll, beforeAll, vi} from 'vitest';

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

beforeAll(() => {
  const argv = [
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
  vi.stubGlobal('process', {...process, argv});
});

afterAll(() => {
  vi.unstubAllGlobals();
  qBittorrentDaemon.kill('SIGKILL');
  fs.rmdirSync(temporaryRuntimeDirectory, {recursive: true});
});
