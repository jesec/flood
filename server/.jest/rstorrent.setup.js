import {spawn} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {afterAll, inject, vi} from 'vitest';

const temporaryRuntimeDirectory = path.join(inject('floodTestTemporaryRoot'), crypto.randomBytes(12).toString('hex'));

const rstorrentSession = path.join(temporaryRuntimeDirectory, '.session');
const rstorrentSocket = path.join(temporaryRuntimeDirectory, 'rstorrent.sock');
const downloadsDirectory = path.join(temporaryRuntimeDirectory, 'downloads');

const findRstorrentBinary = () => {
  if (process.env.RSTORRENT_BIN != null) {
    return process.env.RSTORRENT_BIN;
  }

  const candidates = [
    path.resolve('/home/chmuri/git/rstorrent/target/release/rstorrent'),
    path.resolve('/home/chmuri/git/rstorrent/target/debug/rstorrent'),
    path.resolve('../rstorrent/target/release/rstorrent'),
    path.resolve('../rstorrent/target/debug/rstorrent'),
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));

  if (found == null) {
    throw new Error(
      'rstorrent binary not found. Install rstorrent or set RSTORRENT_BIN=/path/to/rstorrent (see .plan/10-tests.md).',
    );
  }

  return found;
};

fs.mkdirSync(rstorrentSession, {recursive: true});
fs.mkdirSync(downloadsDirectory, {recursive: true});
fs.mkdirSync(path.join(temporaryRuntimeDirectory, 'db'), {recursive: true});
fs.mkdirSync(path.join(temporaryRuntimeDirectory, 'temp'), {recursive: true});

const config = {
  baseURI: '/',
  dbCleanInterval: 1000 * 60 * 60,
  dbPath: path.resolve(path.join(temporaryRuntimeDirectory, 'db')),
  tempPath: path.resolve(path.join(temporaryRuntimeDirectory, 'temp')),
  authMethod: 'none',
  configUser: {
    client: 'rstorrent',
    type: 'grpcSocket',
    version: 1,
    socket: rstorrentSocket,
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

const rstorrentProcess = spawn(
  findRstorrentBinary(),
  ['-n', '-d', downloadsDirectory, '-s', rstorrentSession, '--grpc-socket', rstorrentSocket],
  {
    stdio: 'ignore',
  },
);

// Wait until the gRPC socket is served (the daemon binds it after startup).
const waitForSocket = async (timeoutMs = 20000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (fs.existsSync(rstorrentSocket)) {
      return;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }

  throw new Error(`rstorrent did not expose its gRPC socket at ${rstorrentSocket} within ${timeoutMs} ms`);
};

await waitForSocket();

afterAll(() => {
  rstorrentProcess.kill('SIGTERM');
});
