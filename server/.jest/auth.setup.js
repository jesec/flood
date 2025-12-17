import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const temporaryRuntimeDirectory = path.resolve(os.tmpdir(), `flood.test.${crypto.randomBytes(12).toString('hex')}`);

process.argv = ['node', 'flood'];
process.argv.push('--rundir', temporaryRuntimeDirectory);
process.argv.push('--auth', 'default');
process.argv.push('--assets', 'false');

afterAll(() => {
  if (process.env.CI !== 'true') {
    // TODO: This leads to test flakiness caused by ENOENT error
    // NeDB provides no method to close database connection
    fs.rmdirSync(temporaryRuntimeDirectory, {recursive: true});
  }
});
