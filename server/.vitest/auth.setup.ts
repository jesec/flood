import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const temporaryRuntimeDirectory = path.resolve(os.tmpdir(), `flood.test.${crypto.randomBytes(12).toString('hex')}`);

export default async () => {
  fs.mkdirSync(temporaryRuntimeDirectory, {recursive: true});

  process.argv = ['node', 'flood', '--rundir', temporaryRuntimeDirectory, '--auth', 'default', '--assets', 'false'];

  return () => {
    if (process.env.CI !== 'true') {
      fs.rmSync(temporaryRuntimeDirectory, {recursive: true, force: true});
    }
  };
};
