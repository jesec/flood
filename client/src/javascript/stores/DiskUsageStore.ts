import {makeAutoObservable} from 'mobx';

import type {Disks} from '@shared/types/DiskUsage';

class DiskUsageStoreClass {
  disks: Disks = [];

  constructor() {
    makeAutoObservable(this);
  }

  setDiskUsage(disks: Disks) {
    this.disks = disks;
  }
}

const DiskUsageStore = new DiskUsageStoreClass();

export default DiskUsageStore;
