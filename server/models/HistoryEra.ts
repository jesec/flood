import {setInterval} from 'node:timers';

import Datastore from '@seald-io/nedb';
import type {TransferData, TransferSnapshot} from '@shared/types/TransferData';

import config from '../../config';

interface HistoryEraOpts {
  interval: number;
  maxTime: number;
  name: string;
}

const CUMULATIVE_DATA_BUFFER_DIFF = 500; // 500 milliseconds

class HistoryEra {
  private lastUpdate = 0;
  private opts: HistoryEraOpts;
  private db: Datastore;

  constructor(opts: HistoryEraOpts) {
    this.opts = opts;
    this.db = new Datastore();

    let cleanupInterval = this.opts.maxTime;

    if (cleanupInterval === 0 || cleanupInterval > config.dbCleanInterval) {
      cleanupInterval = config.dbCleanInterval;
    }

    setInterval(this.removeOutdatedData, cleanupInterval);
  }

  private removeOutdatedData = (): Promise<void> => {
    const minTimestamp = Date.now() - this.opts.maxTime;
    return this.db.removeAsync({timestamp: {$lt: minTimestamp}}, {multi: true}).then(
      () => undefined,
      () => undefined,
    );
  };

  async dropDB(): Promise<void> {
    return this.db.dropDatabaseAsync();
  }

  async addData(data: TransferData): Promise<void> {
    const currentTime = Date.now();

    if (currentTime - this.lastUpdate >= this.opts.interval - CUMULATIVE_DATA_BUFFER_DIFF) {
      this.lastUpdate = currentTime;
      await this.db
        .insertAsync({
          timestamp: currentTime,
          ...data,
        })
        .catch(() => undefined);
    } else {
      await this.db.findAsync<TransferSnapshot>({timestamp: this.lastUpdate}).then(
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

            await this.db.updateAsync({timestamp: this.lastUpdate}, updatedSnapshot).catch(() => undefined);
          }
        },
        () => undefined,
      );
    }
  }

  async getData(): Promise<TransferSnapshot[]> {
    const minTimestamp = Date.now() - this.opts.maxTime;

    return this.db
      .findAsync<TransferSnapshot>({timestamp: {$gte: minTimestamp}})
      .sort({timestamp: 1})
      .then((snapshots) => snapshots.slice(snapshots.length - config.maxHistoryStates));
  }
}

export default HistoryEra;
