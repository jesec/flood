import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

const temporaryRuntimeDirectory = path.resolve(os.tmpdir(), crypto.randomBytes(12).toString('hex'));

process.argv = ['node', 'flood'];
process.argv.push('--rundir', temporaryRuntimeDirectory);
process.argv.push('--noauth', 'false');

afterAll(() => fs.rmdirSync(temporaryRuntimeDirectory, {recursive: true}));
