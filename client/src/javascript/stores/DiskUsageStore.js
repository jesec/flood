import BaseStore from './BaseStore';
import ActionTypes from '../constants/ActionTypes';
import EventTypes from '../constants/EventTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';

class DiskUsageStoreClass extends BaseStore {
  constructor() {
    super();
    this.disks = [];
  }

  setDiskUsage(disks) {
    this.disks = disks;
    this.emit(EventTypes.DISK_USAGE_CHANGE);
  }

  getDiskUsage() {
    return this.disks;
  }
}

const DiskUsageStore = new DiskUsageStoreClass();

DiskUsageStore.dispatcherID = AppDispatcher.register(payload => {
  const {action} = payload;
  switch (action.type) {
    case ActionTypes.DISK_USAGE_CHANGE:
      DiskUsageStore.setDiskUsage(action.data);
      break;
    default:
      break;
  }
});

export default DiskUsageStore;
