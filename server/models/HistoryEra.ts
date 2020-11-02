import type {UserInDatabase} from '@shared/schema/Auth';
import type {TransferData, TransferSnapshot} from '@shared/types/TransferData';

import Datastore from 'nedb';
import path from 'path';

import config from '../../config';

interface HistoryEraOpts {
  interval: number;
  maxTime: number;
  name: string;
  nextEraUpdateInterval?: number;
  nextEra?: HistoryEra;
}

const MAX_NEXT_ERA_UPDATE_INTERVAL = 1000 * 60 * 60 * 12; // 12 hours
const CUMULATIVE_DATA_BUFFER_DIFF = 500; // 500 milliseconds

class HistoryEra {
  data = [];
  ready = false;
  lastUpdate = 0;
  startedAt = Date.now();
  opts: HistoryEraOpts;
  db: Datastore<TransferSnapshot>;
  autoCleanupInterval?: NodeJS.Timeout;
  nextEraUpdateInterval?: NodeJS.Timeout;

  constructor(user: UserInDatabase, opts: HistoryEraOpts) {
    this.opts = opts;
    this.db = this.loadDatabase(user._id, opts.name);

    this.setLastUpdate(this.db);
    this.removeOutdatedData(this.db);

    let cleanupInterval = this.opts.maxTime;

    if (cleanupInterval === 0 || cleanupInterval > config.dbCleanInterval) {
      cleanupInterval = config.dbCleanInterval;
    }

    this.autoCleanupInterval = setInterval(this.cleanup, cleanupInterval);
  }

  loadDatabase(userId: UserInDatabase['_id'], dbName: string) {
    const db = new Datastore({
      autoload: true,
      filename: path.join(config.dbPath, userId, 'history', `${dbName}.db`),
    });

    this.ready = true;
    return db;
  }

  addData(data: TransferData) {
    if (!this.ready) {
      console.error('database is not ready');
      return;
    }

    const currentTime = Date.now();

    if (currentTime - this.lastUpdate >= this.opts.interval - CUMULATIVE_DATA_BUFFER_DIFF) {
      this.lastUpdate = currentTime;
      this.db.insert({
        timestamp: currentTime,
        ...data,
      });
    } else {
      this.db.find({timestamp: this.lastUpdate}, (err: Error, snapshots: Array<TransferSnapshot>) => {
        if (err) {
          return;
        }

        if (snapshots.length !== 0) {
          const snapshot = snapshots[0];
          const numUpdates = snapshot.numUpdates || 1;

          // calculate average and update
          const updatedSnapshot: TransferSnapshot = {
            timestamp: this.lastUpdate,
            upload: Number(((snapshot.upload * numUpdates + data.upload) / (numUpdates + 1)).toFixed(1)),
            download: Number(((snapshot.download * numUpdates + data.download) / (numUpdates + 1)).toFixed(1)),
            numUpdates: numUpdates + 1,
          };

          this.db.update({timestamp: this.lastUpdate}, updatedSnapshot);
        }
      });
    }
  }

  cleanup = () => {
    this.removeOutdatedData(this.db);
    this.db.persistence.compactDatafile();
  };

  getData(callback: (snapshots: Array<TransferSnapshot> | null, error?: Error) => void) {
    const minTimestamp = Date.now() - this.opts.maxTime;

    this.db
      .find({timestamp: {$gte: minTimestamp}})
      .sort({timestamp: 1})
      .exec((err, snapshots: Array<TransferSnapshot>) => {
        if (err) {
          callback(null, err);
          return;
        }

        callback(snapshots.slice(snapshots.length - config.maxHistoryStates));
      });
  }

  removeOutdatedData(db: this['db']) {
    if (this.opts.maxTime > 0) {
      const minTimestamp = Date.now() - this.opts.maxTime;
      db.remove({timestamp: {$lt: minTimestamp}}, {multi: true});
    }
  }

  setLastUpdate(db: this['db']): void {
    let lastUpdate = 0;

    db.find({}, (err: Error, snapshots: Array<TransferSnapshot>) => {
      if (err) {
        return;
      }

      snapshots.forEach((snapshot) => {
        if (snapshot.timestamp > lastUpdate) {
          lastUpdate = snapshot.timestamp;
        }
      });

      this.lastUpdate = lastUpdate;
    });
  }

  setNextEra(nextEra: HistoryEra): void {
    this.opts.nextEra = nextEra;

    let {nextEraUpdateInterval} = this.opts;

    if (nextEraUpdateInterval && nextEraUpdateInterval > MAX_NEXT_ERA_UPDATE_INTERVAL) {
      nextEraUpdateInterval = MAX_NEXT_ERA_UPDATE_INTERVAL;
    }

    if (nextEraUpdateInterval) {
      this.nextEraUpdateInterval = setInterval(this.updateNextEra, nextEraUpdateInterval);
    }
  }

  updateNextEra = (): void => {
    if (this.opts.nextEraUpdateInterval == null) {
      return;
    }

    const minTimestamp = Date.now() - this.opts.nextEraUpdateInterval;

    this.db.find({timestamp: {$gte: minTimestamp}}, (err: Error, snapshots: Array<TransferSnapshot>) => {
      if (err || this.opts.nextEra == null) {
        return;
      }

      let downTotal = 0;
      let upTotal = 0;

      snapshots.forEach((snapshot) => {
        downTotal += Number(snapshot.download);
        upTotal += Number(snapshot.upload);
      });

      this.opts.nextEra.addData({
        download: Number(Number(downTotal / snapshots.length).toFixed(1)),
        upload: Number(Number(upTotal / snapshots.length).toFixed(1)),
      });
    });
  };
}

export default HistoryEra;
