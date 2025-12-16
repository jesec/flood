import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const temporaryRuntimeDirectory = path.resolve(os.tmpdir(), `flood.test.${crypto.randomBytes(12).toString('hex')}`);
const rTorrentSession = path.join(temporaryRuntimeDirectory, '.session');
const rTorrentSocket = path.join(temporaryRuntimeDirectory, 'rtorrent.sock');
const rTorrentPidFile = path.join(temporaryRuntimeDirectory, 'rtorrent.pid');
const rTorrentConfig = path.join(temporaryRuntimeDirectory, 'rtorrent.rc');

export default async () => {
  fs.mkdirSync(rTorrentSession, {recursive: true});

  fs.writeFileSync(
    rTorrentConfig,
    `\n` +
      `directory.default.set = "${temporaryRuntimeDirectory}"\n` +
      `session.path.set = "${rTorrentSession}"\n` +
      `network.scgi.open_local = "${rTorrentSocket}"\n`,
  );

  process.argv = [
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
    rTorrentConfig,
    '--test',
    '--assets',
    'false',
  ];

  return () => {
    if (fs.existsSync(rTorrentPidFile)) {
      const pid = Number(fs.readFileSync(rTorrentPidFile).toString());
      if (!Number.isNaN(pid)) {
        try {
          process.kill(pid);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
            throw error;
          }
        }
      }
    }

    if (process.env.CI !== 'true') {
      fs.rmSync(temporaryRuntimeDirectory, {recursive: true, force: true});
    }
  };
};
