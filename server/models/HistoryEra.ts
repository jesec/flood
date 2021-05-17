import type {UserInDatabase} from '@shared/schema/Auth';
import type {TransferData, TransferSnapshot} from '@shared/types/TransferData';

import Datastore from 'nedb-promises';
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
  ready: Promise<void>;
  lastUpdate = 0;
  startedAt = Date.now();
  opts: HistoryEraOpts;
  db: Datastore;
  autoCleanupInterval?: NodeJS.Timeout;
  nextEraUpdateInterval?: NodeJS.Timeout;

  constructor(user: UserInDatabase, opts: HistoryEraOpts) {
    this.opts = opts;
    this.db = Datastore.create({
      autoload: true,
      filename: path.join(config.dbPath, user._id, 'history', `${opts.name}.db`),
    });
    this.ready = this.prepareDatabase();
  }

  private async prepareDatabase(): Promise<void> {
    let lastUpdate = 0;

    await this.db.find<TransferSnapshot>({}).then(
      (snapshots) => {
        snapshots.forEach((snapshot) => {
          if (snapshot.timestamp > lastUpdate) {
            lastUpdate = snapshot.timestamp;
          }
        });

        this.lastUpdate = lastUpdate;
      },
      () => undefined,
    );

    await this.removeOutdatedData();

    let cleanupInterval = this.opts.maxTime;

    if (cleanupInterval === 0 || cleanupInterval > config.dbCleanInterval) {
      cleanupInterval = config.dbCleanInterval;
    }

    this.autoCleanupInterval = setInterval(this.removeOutdatedData, cleanupInterval);
  }

  private removeOutdatedData = async (): Promise<void> => {
    if (this.opts.maxTime > 0) {
      const minTimestamp = Date.now() - this.opts.maxTime;
      return this.db.remove({timestamp: {$lt: minTimestamp}}, {multi: true}).then(
        () => undefined,
        () => undefined,
      );
    }
  };

  private updateNextEra = async (): Promise<void> => {
    if (this.opts.nextEraUpdateInterval == null) {
      return;
    }

    const minTimestamp = Date.now() - this.opts.nextEraUpdateInterval;

    return this.db.find<TransferSnapshot>({timestamp: {$gte: minTimestamp}}).then((snapshots) => {
      if (this.opts.nextEra == null) {
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

  async addData(data: TransferData): Promise<void> {
    await this.ready;

    const currentTime = Date.now();

    if (currentTime - this.lastUpdate >= this.opts.interval - CUMULATIVE_DATA_BUFFER_DIFF) {
      this.lastUpdate = currentTime;
      await this.db
        .insert({
          timestamp: currentTime,
          ...data,
        })
        .catch(() => undefined);
    } else {
      await this.db.find<TransferSnapshot>({timestamp: this.lastUpdate}).then(
        async (snapshots) => {
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

            await this.db.update({timestamp: this.lastUpdate}, updatedSnapshot).catch(() => undefined);
          }
        },
        () => undefined,
      );
    }
  }

  async getData(): Promise<TransferSnapshot[]> {
    await this.ready;

    const minTimestamp = Date.now() - this.opts.maxTime;

    return this.db
      .find<TransferSnapshot>({timestamp: {$gte: minTimestamp}})
      .sort({timestamp: 1})
      .then((snapshots) => snapshots.slice(snapshots.length - config.maxHistoryStates));
  }

  async setNextEra(nextEra: HistoryEra): Promise<void> {
    await this.ready;

    this.opts.nextEra = nextEra;

    let {nextEraUpdateInterval} = this.opts;

    if (nextEraUpdateInterval && nextEraUpdateInterval > MAX_NEXT_ERA_UPDATE_INTERVAL) {
      nextEraUpdateInterval = MAX_NEXT_ERA_UPDATE_INTERVAL;
    }

    if (nextEraUpdateInterval) {
      this.nextEraUpdateInterval = setInterval(this.updateNextEra, nextEraUpdateInterval);
    }
  }
}

export default HistoryEra;
