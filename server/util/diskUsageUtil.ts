import {spawnSync, SpawnSyncOptions} from 'child_process';

import type {Disk} from '@shared/types/DiskUsage';

import config from '../../config';

const spawnAsync = (cmd: string, args: string[], options: SpawnSyncOptions): Promise<string> =>
  new Promise((resolve, reject) => {
    const {stdout, error} = spawnSync(cmd, args, options);

    if (error) {
      reject(error);
      return;
    }

    resolve(stdout.toString('utf-8'));
  });

const PLATFORMS_SUPPORTED = ['darwin', 'linux', 'freebsd', 'win32'] as const;
export type SupportedPlatform = Extract<NodeJS.Platform, typeof PLATFORMS_SUPPORTED[number]>;

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
    spawnAsync('df', ['-T'], {
      maxBuffer: MAX_BUFFER_SIZE,
      timeout: timeout,
    }).then((stdout) =>
      stdout
        .trim()
        .split('\n')
        .slice(1)
        .map((disk) => disk.split(/\s+/))
        .filter((disk) => filterMountPoint(disk[6]))
        .filter((disk) => disk[1] !== 'devtmpfs' && disk[1] !== 'squashfs' && disk[1] !== 'tmpfs')
        .map(([_dev, _fs, size, used, avail, _pcent, target]) => {
          return {
            size: Number.parseInt(size, 10) * 1024,
            used: Number.parseInt(used, 10) * 1024,
            avail: Number.parseInt(avail, 10) * 1024,
            target,
          };
        }),
    ),
  freebsd: (timeout) =>
    spawnAsync('df', [], {
      maxBuffer: MAX_BUFFER_SIZE,
      timeout: timeout,
    }).then((stdout) =>
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
    spawnAsync('df', ['-kl'], {
      maxBuffer: MAX_BUFFER_SIZE,
      timeout: timeout,
    }).then((stdout) =>
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
    spawnAsync('wmic', ['logicaldisk'], {
      maxBuffer: MAX_BUFFER_SIZE,
      timeout: timeout,
    }).then((stdout) =>
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
