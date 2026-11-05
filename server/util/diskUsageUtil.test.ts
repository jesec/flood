import {describe, expect, it} from 'vitest';

import {parseLinuxDfOutput} from './diskUsageUtil';

describe('diskUsageUtil', () => {
  it('parses Busybox df -Pk -T output correctly and excludes unwanted filesystems', () => {
    const busyboxOutput = `Filesystem           Type       1024-blocks    Used Available Capacity Mounted on
overlay              overlay    235712408 182996420  40669652  82% /
tmpfs                tmpfs          65536         0     65536   0% /dev
shm                  tmpfs          65536         0     65536   0% /dev/shm
/dev/mapper/data-root  ext4       235712408 182996420  40669652  82% /downloads
`;

    const parsed = parseLinuxDfOutput(busyboxOutput);
    expect(parsed).toEqual([
      {
        size: 235712408 * 1024,
        used: 182996420 * 1024,
        avail: 40669652 * 1024,
        target: '/downloads',
      },
    ]);
  });

  it('parses GNU df -Pk -T output correctly and handles mount points with spaces', () => {
    const gnuOutput = `Filesystem                Type     1024-blocks        Used  Available Capacity Mounted on
tmpfs                     tmpfs        1622480        2120    1620360       1% /run
/dev/mapper/data-root     ext4       235712408   182998348   40667724      82% /
/dev/sdb1                 btrfs       10000000     2000000    8000000      20% /media/External Drive
`;

    const parsed = parseLinuxDfOutput(gnuOutput);
    expect(parsed).toEqual([
      {
        size: 235712408 * 1024,
        used: 182998348 * 1024,
        avail: 40667724 * 1024,
        target: '/',
      },
      {
        size: 10000000 * 1024,
        used: 2000000 * 1024,
        avail: 8000000 * 1024,
        target: '/media/External Drive',
      },
    ]);
  });
});
