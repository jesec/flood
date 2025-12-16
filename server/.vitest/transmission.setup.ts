import {spawn} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const temporaryRuntimeDirectory = path.resolve(os.tmpdir(), `flood.test.${crypto.randomBytes(12).toString('hex')}`);
const transmissionSession = path.join(temporaryRuntimeDirectory, 'transmission');
const rpcPort = Math.floor(Math.random() * (65534 - 20000) + 20000);

export default async () => {
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

  process.argv = [
    'node',
    'flood',
    '--rundir',
    temporaryRuntimeDirectory,
    '--allowedpath',
    temporaryRuntimeDirectory,
    '--auth',
    'none',
    '--trurl',
    `http://127.0.0.1:${rpcPort}/transmission/rpc`,
    '--truser',
    'transmission',
    '--trpass',
    'transmission',
    '--assets',
    'false',
  ];

  return async () => {
    transmissionProcess.kill('SIGKILL');

    await new Promise((resolve) => {
      transmissionProcess.on('close', resolve);
    });

    if (process.env.CI !== 'true') {
      fs.rmSync(temporaryRuntimeDirectory, {recursive: true, force: true});
    }
  };
};
