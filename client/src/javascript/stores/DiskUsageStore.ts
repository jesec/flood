import {makeAutoObservable} from 'mobx';

import type {Disks} from '@shared/types/DiskUsage';

class DiskUsageStore {
  disks: Disks = [];

  constructor() {
    makeAutoObservable(this);
  }

  setDiskUsage(disks: Disks) {
    this.disks = disks;
  }
}

export default new DiskUsageStore();
