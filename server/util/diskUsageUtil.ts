import {execFile} from 'child_process';
import util from 'util';

import type {Disk} from '@shared/types/DiskUsage';

import config from '../../config';

const execFileAsync = util.promisify(execFile);

const PLATFORMS_SUPPORTED = ['darwin', 'linux', 'freebsd', 'win32'] as const;
export type SupportedPlatform = Extract<NodeJS.Platform, typeof PLATFORMS_SUPPORTED[number]>;

export const isPlatformSupported = (): boolean => {
  return PLATFORMS_SUPPORTED.includes(process.platform as SupportedPlatform);
};

const filterMountPoint =
  config.diskUsageService && config.diskUsageService.watchMountPoints
    ? // if user has configured watchMountPoints, filter each line output for given array
      (mountpoint: string) => config.diskUsageService.watchMountPoints.includes(mountpoint)
    : () => true; // include all mounted file systems by default

const MAX_BUFFER_SIZE = 65536;
export const diskUsage: Readonly<Record<SupportedPlatform, () => Promise<Array<Disk>>>> = {
  linux: () =>
    execFileAsync('df -T | tail -n+2', {
      shell: true,
      maxBuffer: MAX_BUFFER_SIZE,
    }).then(({stdout}) =>
      stdout
        .trim()
        .split('\n')
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
  freebsd: () =>
    execFileAsync('df | tail -n+2', {
      shell: true,
      maxBuffer: MAX_BUFFER_SIZE,
    }).then(({stdout}) =>
      stdout
        .trim()
        .split('\n')
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
  darwin: () =>
    execFileAsync('df -kl | tail -n+2', {
      shell: true,
      maxBuffer: MAX_BUFFER_SIZE,
    }).then(({stdout}) =>
      stdout
        .trim()
        .split('\n')
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
  win32: () =>
    execFileAsync('wmic logicaldisk', {
      shell: true,
      maxBuffer: MAX_BUFFER_SIZE,
    }).then(({stdout}) =>
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
