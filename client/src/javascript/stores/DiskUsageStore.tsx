import BaseStore from './BaseStore';
import AppDispatcher from '../dispatcher/AppDispatcher';

export interface Disk {
  target: string;
  size: number;
  avail: number;
  used: number;
}

export type Disks = Array<Disk>;

class DiskUsageStoreClass extends BaseStore {
  disks: Disks = [];

  setDiskUsage(disks: Disks) {
    this.disks = disks;
    this.emit('DISK_USAGE_CHANGE');
  }

  getDiskUsage() {
    return this.disks;
  }
}

const DiskUsageStore = new DiskUsageStoreClass();

DiskUsageStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action} = payload;

  if (action.type === 'DISK_USAGE_CHANGE') {
    DiskUsageStore.setDiskUsage(action.data as Disks);
  }
});

export default DiskUsageStore;
