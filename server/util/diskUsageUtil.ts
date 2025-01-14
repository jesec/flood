import {spawn, SpawnOptions} from 'node:child_process';

import type {Disk} from '@shared/types/DiskUsage';

import config from '../../config';

const spawnAsync = (cmd: string, args: string[], options: SpawnOptions, maxBuffer: number): Promise<string> =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, options);

    let stdout = '';
    let stderr = '';

    child.once('error', (err) => {
      reject(err);
    });

    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString('utf-8');
      if (stdout.length > maxBuffer) {
        child.kill(9);
      }
    });

    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString('utf-8');
      if (stderr.length > maxBuffer) {
        child.kill(9);
      }
    });

    child.on('close', (code) => {
      if (code == 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr));
      }
    });
  });

const PLATFORMS_SUPPORTED = ['darwin', 'linux', 'freebsd', 'win32'] as const;
export type SupportedPlatform = Extract<NodeJS.Platform, (typeof PLATFORMS_SUPPORTED)[number]>;

export const isPlatformSupported = (): boolean => {
  return PLATFORMS_SUPPORTED.includes(process.platform as SupportedPlatform);
};

const filterMountPoint = (mountpoint: string) => {
  const {watchMountPoints} = config;

  if (watchMountPoints != null) {
    // if user has configured watchMountPoints, filter each line output for given array
    return watchMountPoints.includes(mountpoint);
  }

  // include all mounted file systems by default
  return true;
};

const MAX_BUFFER_SIZE = 65536;
export const diskUsage: Readonly<Record<SupportedPlatform, (timeout: number) => Promise<Array<Disk>>>> = {
  linux: (timeout) =>
    spawnAsync(
      'df',
      ['--exclude-type=devtmpfs', '--exclude-type=squashfs', '--exclude-type=tmpfs', '--exclude-type=overlay'],
      {
        timeout: timeout,
      },
      MAX_BUFFER_SIZE,
    ).then((stdout) =>
      stdout
        .trim()
        .split('\n')
        .slice(1)
        .map((disk) => disk.split(/\s+/))
        .filter((disk) => filterMountPoint(disk[5]))
        .map(([_dev, size, used, avail, _pcent, target]) => {
          return {
            size: Number.parseInt(size, 10) * 1024,
            used: Number.parseInt(used, 10) * 1024,
            avail: Number.parseInt(avail, 10) * 1024,
            target,
          };
        }),
    ),
  freebsd: (timeout) =>
    spawnAsync(
      'df',
      [],
      {
        timeout: timeout,
      },
      MAX_BUFFER_SIZE,
    ).then((stdout) =>
      stdout
        .trim()
        .split('\n')
        .slice(1)
        .map((disk) => disk.split(/\s+/))
        .filter((disk) => filterMountPoint(disk[5]))
        .map(([_dev, size, used, avail, _pcent, target]) => {
          return {
            size: Number.parseInt(size, 10) * 1024,
            used: Number.parseInt(used, 10) * 1024,
            avail: Number.parseInt(avail, 10) * 1024,
            target,
          };
        }),
    ),
  darwin: (timeout) =>
    spawnAsync(
      'df',
      ['-kl'],
      {
        timeout: timeout,
      },
      MAX_BUFFER_SIZE,
    ).then((stdout) =>
      stdout
        .trim()
        .split('\n')
        .slice(1)
        .map((disk) => disk.split(/\s+/))
        .filter((disk) => filterMountPoint(disk[8]))
        .map(([_dev, size, used, avail, _pcent, _iused, _ifree, _piused, target]) => {
          return {
            size: Number.parseInt(size, 10) * 1024,
            used: Number.parseInt(used, 10) * 1024,
            avail: Number.parseInt(avail, 10) * 1024,
            target,
          };
        }),
    ),
  win32: (timeout) =>
    spawnAsync(
      'wmic',
      ['logicaldisk'],
      {
        timeout: timeout,
      },
      MAX_BUFFER_SIZE,
    ).then((stdout) =>
      stdout
        .trim()
        .split('\n')
        .slice(1)
        .map((disk) => disk.split(/\s+/))
        .filter((disk) => filterMountPoint(disk[1]))
        .map((disk) => ({
          size: Number(disk[14]),
          used: Number(disk[14]) - Number(disk[10]),
          avail: Number(disk[10]),
          target: disk[1],
        })),
    ),
};
