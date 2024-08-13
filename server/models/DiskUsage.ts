import {EventEmitter} from 'node:events';

import type {Disks} from '@shared/types/DiskUsage';
import type TypedEmitter from 'typed-emitter';

import type {SupportedPlatform} from '../util/diskUsageUtil';
import {diskUsage, isPlatformSupported} from '../util/diskUsageUtil';

export interface DiskUsageSummary {
  id: number;
  disks: Disks;
}

type DiskUsageEvents = {
  DISK_USAGE_CHANGE: (usage: DiskUsageSummary) => void;
  newListener: (event: keyof Omit<DiskUsageEvents, 'newListener' | 'removeListener'>) => void;
  removeListener: (event: keyof Omit<DiskUsageEvents, 'newListener' | 'removeListener'>) => void;
};

const INTERVAL_UPDATE = 10000;

class DiskUsage extends (EventEmitter as new () => TypedEmitter<DiskUsageEvents>) {
  disks: Disks = [];
  tLastChange = 0;
  interval = 0;
  updateInterval?: NodeJS.Timeout;

  constructor() {
    super();

    if (!isPlatformSupported()) {
      console.log('DiskUsage: this platform is not supported');
      return;
    }

    this.updateDisks();

    // start polling disk usage when the first listener is added
    this.on('newListener', (event) => {
      if (this.listenerCount('DISK_USAGE_CHANGE') === 0 && event === 'DISK_USAGE_CHANGE') {
        this.updateInterval = setInterval(this.updateDisks, INTERVAL_UPDATE);
      }
    });

    // stop polling disk usage when the last listener is removed
    this.on('removeListener', (event) => {
      if (
        this.listenerCount('DISK_USAGE_CHANGE') === 0 &&
        event === 'DISK_USAGE_CHANGE' &&
        this.updateInterval != null
      ) {
        clearInterval(this.updateInterval);
      }
    });
  }

  private updateDisks = () => {
    return diskUsage[process.platform as SupportedPlatform](INTERVAL_UPDATE / 2)
      .then((disks) => {
        // Mountpoints with a very long path are unlikely to be useful.
        return disks.filter((disk) => typeof disk.target === 'string' && disk.target.length < 30);
      })
      .then((disks) => {
        if (disks.length !== this.disks.length || disks.some((d, i) => d.used !== this.disks[i].used)) {
          this.tLastChange = Date.now();
          this.disks = disks;
          this.emit('DISK_USAGE_CHANGE', this.getDiskUsage());
        }
      })
      .catch((e) => {
        console.error(`DiskUsage: failed to update: ${e.code ? `${e.code}: ` : ''}${e.message}`);
      });
  };

  getDiskUsage(): DiskUsageSummary {
    return {
      id: this.tLastChange,
      disks: this.disks,
    } as const;
  }
}

export default new DiskUsage();
