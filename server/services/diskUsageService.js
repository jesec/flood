/**
 * This service is not per rtorrent session, which is why it does not inherit
 * `BaseService` nor have any use of the per user API ie. `getSerivce()`
 */
const EventEmitter = require('events');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const config = require('../../config');
const diskUsageServiceEvents = require('../constants/diskUsageServiceEvents');

const PLATFORMS_SUPPORTED = ['darwin', 'linux'];

const filterMountPoint =
  config.diskUsageService && config.diskUsageService.watchMountPoints
    ? // if user has configured watchPartitions filter each line output for given
      // array
      mountpoint => config.diskUsageService.watchMountPoints.includes(mountpoint)
    : () => true; // include all mounted file systems by default

const diskUsage = {
  linux: () =>
    execFile('df | tail -n+2', {
      shell: true,
      maxBuffer: 4096,
    }).then(({stdout}) =>
      stdout
        .trim()
        .split('\n')
        .map(disk => disk.split(/\s+/))
        .filter(disk => filterMountPoint(disk[5]))
        .map(([_fs, size, used, avail, _pcent, target]) => {
          return {
            size: Number.parseInt(size, 10) * 1024,
            used: Number.parseInt(used, 10) * 1024,
            avail: Number.parseInt(avail, 10) * 1024,
            target,
          };
        }),
    ),
  darwin: () =>
    execFile('df -kl | tail -n+2', {
      shell: true,
      maxBuffer: 4096,
    }).then(({stdout}) =>
      stdout
        .trim()
        .split('\n')
        .map(disk => disk.split(/\s+/))
        .filter(disk => filterMountPoint(disk[8]))
        .map(([_fs, size, used, avail, _pcent, _iused, _ifree, _piused, target]) => {
          return {
            size: Number.parseInt(size, 10) * 1024,
            used: Number.parseInt(used, 10) * 1024,
            avail: Number.parseInt(avail, 10) * 1024,
            target,
          };
        }),
    ),
  // TODO:
  win32: () => Promise.resolve([]),
};

const INTERVAL_UPDATE = 10000;

class DiskUsageService extends EventEmitter {
  constructor() {
    super();
    this.disks = [];
    this.tLastChange = 0;
    this.interval = 0;

    if (!PLATFORMS_SUPPORTED.includes(process.platform)) {
      console.log(`warning: DiskUsageService is only supported in ${PLATFORMS_SUPPORTED.join()}`);
      return;
    }

    // start polling disk usage when the first listener is added
    this.on('newListener', event => {
      if (
        this.listenerCount(diskUsageServiceEvents.DISK_USAGE_CHANGE) === 0 &&
        event === diskUsageServiceEvents.DISK_USAGE_CHANGE
      ) {
        this.updateInterval = setInterval(this.updateDisks.bind(this), INTERVAL_UPDATE);
      }
    });

    // stop polling disk usage when the last listener is removed
    this.on('removeListener', event => {
      if (
        this.listenerCount(diskUsageServiceEvents.DISK_USAGE_CHANGE) === 0 &&
        event === diskUsageServiceEvents.DISK_USAGE_CHANGE
      ) {
        clearInterval(this.updateInterval);
      }
    });
  }

  updateDisks() {
    return diskUsage[process.platform]().then(disks => {
      if (disks.length !== this.disks.length || disks.some((d, i) => d.used !== this.disks[i].used)) {
        this.tLastChange = Date.now();
        this.disks = disks;
        this.emit(diskUsageServiceEvents.DISK_USAGE_CHANGE, this.getDiskUsage());
      }
    });
  }

  getDiskUsage() {
    return {
      id: this.tLastChange,
      disks: this.disks,
    };
  }
}

module.exports = new DiskUsageService();
