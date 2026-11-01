import {spawn} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {afterAll, inject, vi} from 'vitest';

const temporaryRuntimeDirectory = path.join(inject('floodTestTemporaryRoot'), crypto.randomBytes(12).toString('hex'));

const transmissionSession = path.join(temporaryRuntimeDirectory, 'transmission');
const rpcPort = Math.floor(Math.random() * (65534 - 20000) + 20000);

fs.mkdirSync(transmissionSession, {recursive: true});
fs.mkdirSync(path.join(temporaryRuntimeDirectory, 'db'), {recursive: true});
fs.mkdirSync(path.join(temporaryRuntimeDirectory, 'temp'), {recursive: true});

const config = {
  baseURI: '/',
  dbCleanInterval: 1000 * 60 * 60,
  dbPath: path.resolve(path.join(temporaryRuntimeDirectory, 'db')),
  tempPath: path.resolve(path.join(temporaryRuntimeDirectory, 'temp')),
  authMethod: 'none',
  configUser: {
    client: 'Transmission',
    type: 'rpc',
    version: 1,
    url: `http://127.0.0.1:${rpcPort}/transmission/rpc`,
    username: 'transmission',
    password: 'transmission',
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

const transmissionProcess = spawn(
  'transmission-daemon',
  [
    '-f',
    '-w',
    temporaryRuntimeDirectory,
    '-g',
    transmissionSession,
    '-p',
    `${rpcPort}`,
    '-u',
    'transmission',
    '-v',
    'transmission',
  ],
  {
    stdio: 'ignore',
    killSignal: 'SIGKILL',
  },
);

afterAll(async () => {
  await new Promise((resolve) => {
    transmissionProcess.on('close', resolve);
    transmissionProcess.kill('SIGKILL');
  });
});
