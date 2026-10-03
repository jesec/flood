import path from 'node:path';

import Datastore from '@seald-io/nedb';
import type {TransferHistory, TransferSummary} from '@shared/types/TransferData';

import config from '../../config';
import HistoryEra from '../models/HistoryEra';
import BaseService from './BaseService';

type HistoryServiceEvents = {
  TRANSFER_SUMMARY_FULL_UPDATE: (payload: {id: number; summary: TransferSummary}) => void;
  FETCH_TRANSFER_SUMMARY_SUCCESS: () => void;
  FETCH_TRANSFER_SUMMARY_ERROR: () => void;
};

// Torrent clients only report totals for their current session. Flood keeps
// the previous sessions' totals so the sidebar numbers survive client restarts.
export interface TransferTotals {
  // Sum of totals from sessions that ended
  downBase: number;
  upBase: number;
  // Totals last reported by the client, used to detect a reset
  downLast: number;
  upLast: number;
}

export const accumulateTotals = (
  totals: TransferTotals,
  downTotal: number,
  upTotal: number,
): {totals: TransferTotals; carried: boolean} => {
  // Client total went down: the client restarted and started a new session.
  const carried = downTotal < totals.downLast || upTotal < totals.upLast;
  return {
    carried,
    totals: {
      downBase: carried ? totals.downBase + totals.downLast : totals.downBase,
      upBase: carried ? totals.upBase + totals.upLast : totals.upBase,
      downLast: downTotal,
      upLast: upTotal,
    },
  };
};

const TOTALS_PERSIST_INTERVAL = 1000 * 60; // 1 minute

class HistoryService extends BaseService<HistoryServiceEvents> {
  private errorCount = 0;
  private pollTimeout?: NodeJS.Timeout;

  private totals: TransferTotals = {downBase: 0, upBase: 0, downLast: 0, upLast: 0};
  private totalsLastPersisted = 0;
  private totalsDB = new Datastore({
    autoload: true,
    filename: path.join(config.dbPath, this.user._id, 'history', 'totals.db'),
  });

  private transferSummary: TransferSummary = {
    downRate: 0,
    downTotal: 0,
    upRate: 0,
    upTotal: 0,
  };

  private snapshot = new HistoryEra({
    interval: 1000 * 5, // 5 seconds
    maxTime: 1000 * 60 * 5, // 5 minutes
    name: 'fiveMinSnapshot',
  });

  constructor(...args: ConstructorParameters<typeof BaseService>) {
    super(...args);

    this.totalsDB.setAutocompactionInterval(config.dbCleanInterval);

    this.onServicesUpdated = () => {
      this.loadTotals().then(this.fetchCurrentTransferSummary);
    };
  }

  private loadTotals = async (): Promise<void> => {
    const doc = await this.totalsDB.findOneAsync<TransferTotals & {client: string}>({_id: 'totals'}).catch(() => null);
    // Totals from another torrent client are meaningless, start over
    if (doc != null && doc.client === this.user.client.client) {
      this.totals = {downBase: doc.downBase, upBase: doc.upBase, downLast: doc.downLast, upLast: doc.upLast};
    }
  };

  private persistTotals = async (): Promise<void> => {
    this.totalsLastPersisted = Date.now();
    await this.totalsDB
      .updateAsync({_id: 'totals'}, {$set: {...this.totals, client: this.user.client.client}}, {upsert: true})
      .catch(() => undefined);
  };

  async resetTransferTotals(): Promise<void> {
    this.totals = {downBase: 0, upBase: 0, downLast: this.totals.downLast, upLast: this.totals.upLast};
    await this.persistTotals();
    this.transferSummary = {...this.transferSummary, downTotal: this.totals.downLast, upTotal: this.totals.upLast};
    this.emit('TRANSFER_SUMMARY_FULL_UPDATE', {summary: this.transferSummary, id: Date.now()});
  }

  private fetchCurrentTransferSummary = () => {
    if (this.pollTimeout != null) {
      clearTimeout(this.pollTimeout);
    }

    this.services?.clientGatewayService
      ?.fetchTransferSummary()
      .then(this.handleFetchTransferSummarySuccess)
      .catch(this.handleFetchTransferSummaryError);
  };

  private deferFetchTransferSummary(interval = config.torrentClientPollInterval) {
    this.pollTimeout = setTimeout(this.fetchCurrentTransferSummary, interval);
  }

  private handleFetchTransferSummarySuccess = async (clientTransferSummary: TransferSummary): Promise<void> => {
    const {totals, carried} = accumulateTotals(
      this.totals,
      clientTransferSummary.downTotal,
      clientTransferSummary.upTotal,
    );
    this.totals = totals;

    if (carried || Date.now() - this.totalsLastPersisted >= TOTALS_PERSIST_INTERVAL) {
      await this.persistTotals();
    }

    const nextTransferSummary: TransferSummary = {
      ...clientTransferSummary,
      downTotal: totals.downBase + clientTransferSummary.downTotal,
      upTotal: totals.upBase + clientTransferSummary.upTotal,
    };

    this.emit('TRANSFER_SUMMARY_FULL_UPDATE', {
      summary: nextTransferSummary,
      id: Date.now(),
    });

    this.errorCount = 0;
    this.transferSummary = nextTransferSummary;

    await this.snapshot.addData({
      upload: nextTransferSummary.upRate,
      download: nextTransferSummary.downRate,
    });

    this.deferFetchTransferSummary();

    this.emit('FETCH_TRANSFER_SUMMARY_SUCCESS');
  };

  private handleFetchTransferSummaryError = () => {
    let nextInterval = config.torrentClientPollInterval;

    // If more than 2 consecutive errors have occurred, then we delay the next request.
    this.errorCount += 1;
    if (this.errorCount > 2) {
      nextInterval = Math.max(nextInterval + (this.errorCount * nextInterval) / 4, 1000 * 60);
    }

    this.deferFetchTransferSummary(nextInterval);

    this.emit('FETCH_TRANSFER_SUMMARY_ERROR');
  };

  async destroy(drop: boolean) {
    if (this.pollTimeout != null) {
      clearTimeout(this.pollTimeout);
    }

    if (drop) {
      await this.snapshot.dropDB();
      await this.totalsDB.dropDatabaseAsync();
    }

    return super.destroy(drop);
  }

  getTransferSummary() {
    return {
      id: Date.now(),
      transferSummary: this.transferSummary,
    } as const;
  }

  async getHistory(): Promise<TransferHistory> {
    return this.snapshot.getData().then((transferSnapshots) =>
      transferSnapshots.reduce(
        (history, transferSnapshot) => {
          history.download.push(transferSnapshot.download);
          history.upload.push(transferSnapshot.upload);
          history.timestamps.push(transferSnapshot.timestamp);

          return history;
        },
        {upload: [], download: [], timestamps: []} as TransferHistory,
      ),
    );
  }
}

export default HistoryService;
