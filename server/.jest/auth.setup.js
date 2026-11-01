import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {inject, vi} from 'vitest';

const temporaryRuntimeDirectory = path.join(inject('floodTestTemporaryRoot'), crypto.randomBytes(12).toString('hex'));

fs.mkdirSync(temporaryRuntimeDirectory, {recursive: true});
fs.mkdirSync(path.join(temporaryRuntimeDirectory, 'db'), {recursive: true});
fs.mkdirSync(path.join(temporaryRuntimeDirectory, 'temp'), {recursive: true});

const config = {
  baseURI: '/',
  dbCleanInterval: 1000 * 60 * 60,
  dbPath: path.resolve(path.join(temporaryRuntimeDirectory, 'db')),
  tempPath: path.resolve(path.join(temporaryRuntimeDirectory, 'temp')),
  authMethod: 'default',
  configUser: undefined,
  floodServerHost: '127.0.0.1',
  floodServerPort: 3000,
  maxHistoryStates: 30,
  torrentClientPollInterval: 1000 * 2,
  torrentClientPollIntervalIdle: 1000 * 60 * 15,
  secret: crypto.randomBytes(36).toString('hex'),
  ssl: false,
  sslKey: path.resolve(path.join(temporaryRuntimeDirectory, 'key.pem')),
  sslCert: path.resolve(path.join(temporaryRuntimeDirectory, 'fullchain.pem')),
  allowedPaths: undefined,
  serveAssets: false,
  disableRateLimit: false,
};

vi.mock('../../config', () => ({
  __esModule: true,
  default: config,
}));
