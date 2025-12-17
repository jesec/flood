import {spawn} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {afterAll, vi} from 'vitest';

const temporaryRuntimeDirectory = path.resolve(os.tmpdir(), `flood.test.${crypto.randomBytes(12).toString('hex')}`);

fs.mkdirSync(temporaryRuntimeDirectory, {recursive: true});
fs.mkdirSync(path.join(temporaryRuntimeDirectory, 'db'), {recursive: true});
fs.mkdirSync(path.join(temporaryRuntimeDirectory, 'temp'), {recursive: true});

const qbtPort = Math.floor(Math.random() * (65534 - 20000) + 20000);

const config = {
  baseURI: '/',
  dbCleanInterval: 1000 * 60 * 60,
  dbPath: path.resolve(path.join(temporaryRuntimeDirectory, 'db')),
  tempPath: path.resolve(path.join(temporaryRuntimeDirectory, 'temp')),
  authMethod: 'none',
  configUser: {
    client: 'qBittorrent',
    type: 'web',
    version: 1,
    url: `http://127.0.0.1:${qbtPort}`,
    username: 'admin',
    password: 'adminadmin',
  },
  floodServerHost: '127.0.0.1',
  floodServerPort: 3000,
  maxHistoryStates: 30,
  torrentClientPollInterval: 1000 * 2,
  torrentClientPollIntervalIdle: 1000 * 60 * 15,
  secret: crypto.randomBytes(36).toString('hex'),
  ssl: false,
  sslKey: path.resolve(path.join(temporaryRuntimeDirectory, 'key.pem')),
  sslCert: path.resolve(path.join(temporaryRuntimeDirectory, 'fullchain.pem')),
  allowedPaths: [temporaryRuntimeDirectory],
  serveAssets: false,
  disableRateLimit: false,
};

vi.mock('../../config', () => ({
  __esModule: true,
  default: config,
}));

const qBittorrentDaemon = spawn(
  'qbittorrent-nox',
  [`--webui-port=${qbtPort}`, `--profile=${temporaryRuntimeDirectory}`],
  {
    stdio: 'ignore',
    killSignal: 'SIGKILL',
  },
);

afterAll(() => {
  qBittorrentDaemon.kill('SIGKILL');
  fs.rmdirSync(temporaryRuntimeDirectory, {recursive: true});
});
