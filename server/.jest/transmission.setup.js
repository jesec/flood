import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {spawn} from 'child_process';

const temporaryRuntimeDirectory = path.resolve(os.tmpdir(), `flood.test.${crypto.randomBytes(12).toString('hex')}`);

const transmissionSession = path.join(temporaryRuntimeDirectory, 'transmission');
const rpcPort = Math.floor(Math.random() * (65534 - 20000) + 20000);

fs.mkdirSync(transmissionSession, {recursive: true});

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

process.argv = ['node', 'flood'];
process.argv.push('--rundir', temporaryRuntimeDirectory);
process.argv.push('--allowedpath', temporaryRuntimeDirectory);
process.argv.push('--auth', 'none');
process.argv.push('--trurl', `http://127.0.0.1:${rpcPort}/transmission/rpc`);
process.argv.push('--truser', 'transmission');
process.argv.push('--trpass', 'transmission');
process.argv.push('--assets', 'false');

afterAll((done) => {
  transmissionProcess.on('close', () => {
    if (process.env.CI !== 'true') {
      // TODO: This leads to test flakiness caused by ENOENT error
      // NeDB provides no method to close database connection
      fs.rmdirSync(temporaryRuntimeDirectory, {recursive: true});
    }
    done();
  });

  transmissionProcess.kill('SIGKILL');
});
