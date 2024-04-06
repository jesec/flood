import chokidar, {FSWatcher} from 'chokidar';
import {openAndDecodeTorrent} from '../util/torrentFileUtil';
import type {WatchItem} from '@shared/types/Watch';
export interface DirectoryWatcherOptions {
  watcherID: string;
  watcherLabel: string;
  directory: string;
  destination: string;
  tags: string[];
  maxHistory: number;
  onNewItems: (options: DirectoryWatcherOptions, torrent: WatchItem | null) => void;
}

export default class DirectoryWatcher {
  private options: DirectoryWatcherOptions;
  private watcher: FSWatcher | null = null;

  constructor(options: DirectoryWatcherOptions) {
    this.options = options;

    this.initReader();
  }

  modify(options: Partial<DirectoryWatcherOptions>) {
    this.options = {...this.options, ...options};
    this.initReader();
  }

  getOptions() {
    return this.options;
  }

  initReader() {
    this.watcher = chokidar.watch(this.options.directory, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    this.watcher
      .on('add', this.handleAdd)
      .on('error', error =>  console.log('Watcher error:', error));
  }

  handleAdd = async (path: string) => {
    const filename = path.replace(/^.*[\\\/]/, '');
    if(filename.endsWith(".added") || await openAndDecodeTorrent(path) == null)
      return;
    this.options.onNewItems(this.options, { file: path, filename: filename });
  };

  stopWatching() {
    if (this.watcher != null) {
      this.watcher.close().then(
        this.watcher = null
      );
    }
  }
}