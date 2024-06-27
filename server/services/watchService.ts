import path from 'path';
import Datastore from '@seald-io/nedb';

import BaseService from './BaseService';
import config from '../../config';
import DirectoryWatcher, {DirectoryWatcherOptions} from '../models/DirectoryWatcher';

import type {WatchedDirectory, WatchItem} from '@shared/types/Watch';
import {AddWatchOptions, ModifyWatchOptions} from '@shared/types/api/watch-monitor';
import fs from 'fs';

class WatchService extends BaseService<Record<string, never>> {
  directoryWatchers: Array<DirectoryWatcher> = [];
  db = new Datastore({
    autoload: true,
    filename: path.join(config.dbPath, this.user._id, 'settings', 'watch.db'),
  });

  constructor(...args: ConstructorParameters<typeof BaseService>) {
    super(...args);

    this.onServicesUpdated = async () => {
      // Execute once only.
      this.onServicesUpdated = () => undefined;

      // Loads state from database.
      const watchesSummary = await this.db.findAsync<WatchedDirectory>({}).catch(() => undefined);

      if (watchesSummary == null) {
        return;
      }

      // Initiate all feeds.
      watchesSummary.forEach((feed) => {
        this.startNewWatch(feed);
      });
    };
  }

  async destroy(drop: boolean) {
    if (drop) {
      await this.db.dropDatabaseAsync();
    }

    return super.destroy(drop);
  }

  private startNewWatch(watchedDirectory: WatchedDirectory) {
    const {_id : watcherId, label , dir, destination, tags} = watchedDirectory;

    this.directoryWatchers.push(
      new DirectoryWatcher({
        watcherID: watcherId,
        watcherLabel: label,
        directory: dir,
        maxHistory: 100,
        onNewItems: this.handleNewItems,
        destination,
        tags
      }),
    );
    return true;
  }


  /**
   * Subscribes to a feed
   *
   * @param {AddFeedOptions} options - An object of options...
   * @return {Promise<Feed>} - Resolves with Feed or rejects with error.
   */
  async addWatch({dir, label, destination, tags}: AddWatchOptions): Promise<WatchedDirectory> {
    const newWatch = (await this.db.insertAsync<Omit<WatchedDirectory, '_id'>>({type: 'watchedDirectory', dir, label, destination, tags})) as WatchedDirectory;

    this.startNewWatch(newWatch);

    return newWatch;
  }

  /**
   * Modifies the options of a feed subscription
   *
   * @param {string} id - Unique ID of the feed
   * @param {ModifyFeedOptions} options - An object of options...
   * @return {Promise<void>} - Rejects with error.
   */
  async modifyWatch(id: string, {dir, label}: ModifyWatchOptions): Promise<void> {
    const modifiedDirWatcher = this.directoryWatchers.find((feedReader) => feedReader.getOptions().watcherID === id);

    if (modifiedDirWatcher == null) {
      throw new Error();
    }

    modifiedDirWatcher.stopWatching();
    modifiedDirWatcher.modify(JSON.parse(JSON.stringify({feedLabel: label, directory: dir})));

    return this.db
      .updateAsync({_id: id}, {$set: JSON.parse(JSON.stringify({label, dir }))}, {})
      .then(() => undefined);
  }

  async getAll(): Promise<Array<WatchedDirectory>> {
    return this.db.findAsync<WatchedDirectory>({});
  }

  async getWatch(id: string): Promise<Array<WatchedDirectory>> {
    return this.db.findAsync<WatchedDirectory>({_id: id});
  }

  handleNewItems = async (options: DirectoryWatcherOptions, torrent: WatchItem | null): Promise<void> => {
    console.log(options, torrent)
    if(torrent == null)
      return;
    const { watcherID, watcherLabel, tags, destination} = options;

    await this.services?.clientGatewayService.addTorrentsByURL({
      urls: [torrent.file],
      cookies: {},
      destination: destination,
      tags: tags,
      isBasePath: false,
      isCompleted: false,
      isSequential: false,
      isInitialSeeding:false,
      start: true,
    }).then(() => {
      this.db.update({_id: watcherID}, {$inc: {count: 1}}, {upsert: true});
      this.services?.notificationService.addNotification(
        [{
          id: 'notification.feed.torrent.added',
          data: {
            title: torrent.filename,
            feedLabel: watcherLabel,
            ruleLabel: ''
          }
        }],
      );
      this.services?.torrentService.fetchTorrentList();
      fs.rename(torrent.file, torrent.file+'.added', (error) => {
        if (error) { console.error(error);}
      });
    })
      .catch(console.error);
  };

  async removeItem(id: string): Promise<void> {
    let directoryWatcherToRemoveIndex = -1;
    const directoryWatcherToRemove = this.directoryWatchers.find((watcher, index) => {
      if (watcher.getOptions().watcherID === id) {
        directoryWatcherToRemoveIndex = index;
        return true;
      }

      return false;
    });

    if (directoryWatcherToRemove != null) {
      directoryWatcherToRemove.stopWatching();
      this.directoryWatchers.splice(directoryWatcherToRemoveIndex, 1);
    }

    return this.db.removeAsync({_id: id}, {}).then(() => undefined);
  }
}

export default WatchService;
