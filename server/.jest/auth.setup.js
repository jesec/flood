import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterAll, beforeAll, vi} from 'vitest';

const temporaryRuntimeDirectory = path.resolve(os.tmpdir(), `flood.test.${crypto.randomBytes(12).toString('hex')}`);

beforeAll(() => {
  const argv = ['node', 'flood', '--rundir', temporaryRuntimeDirectory, '--auth', 'default', '--assets', 'false'];
  vi.stubGlobal('process', {...process, argv});
});

afterAll(() => {
  vi.unstubAllGlobals();
  if (process.env.CI !== 'true') {
    // TODO: This leads to test flakiness caused by ENOENT error
    // NeDB provides no method to close database connection
    fs.rmdirSync(temporaryRuntimeDirectory, {recursive: true});
  }
});
