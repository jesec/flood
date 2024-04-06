import {makeAutoObservable} from 'mobx';
import {WatchedDirectory} from '@shared/types/Watch';

class WatchStore {
  watchedDirectories: Array<WatchedDirectory> = [];

  constructor() {
    makeAutoObservable(this);
  }

  setWatchedDirectories(newWatches: Array<WatchedDirectory>): void {
    if (newWatches == null) {
      this.watchedDirectories = [];
      return;
    }

    this.watchedDirectories = [...newWatches].sort((a, b) => a.label.localeCompare(b.label));
  }


  handleWatchedDirectoryFetchSuccess(newWatches: Array<WatchedDirectory>): void {
    this.setWatchedDirectories(newWatches);
  }
}

export default new WatchStore();
