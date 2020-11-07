import jsonpatch, {Operation} from 'fast-json-patch';

import type {HistorySnapshot} from '@shared/constants/historySnapshotTypes';
import type {TransferHistory, TransferSummary} from '@shared/types/TransferData';

import BaseService from './BaseService';
import config from '../../config';
import HistoryEra from '../models/HistoryEra';

interface HistoryServiceEvents {
  TRANSFER_SUMMARY_DIFF_CHANGE: (payload: {id: number; diff: Operation[]}) => void;
  FETCH_TRANSFER_SUMMARY_SUCCESS: () => void;
  FETCH_TRANSFER_SUMMARY_ERROR: () => void;
}

class HistoryService extends BaseService<HistoryServiceEvents> {
  errorCount = 0;
  pollTimeout?: NodeJS.Timeout;
  lastSnapshots: Partial<Record<HistorySnapshot, TransferHistory>> = {};

  transferSummary: TransferSummary = {
    downRate: 0,
    downTotal: 0,
    upRate: 0,
    upTotal: 0,
  };

  snapshots: Record<HistorySnapshot, HistoryEra> = {
    YEAR: new HistoryEra(this.user, {
      interval: 1000 * 60 * 60 * 24 * 7, // 7 days
      maxTime: 0, // infinite
      name: 'yearSnapshot',
    }),

    MONTH: new HistoryEra(this.user, {
      interval: 1000 * 60 * 60 * 12, // 12 hours
      maxTime: 1000 * 60 * 60 * 24 * 365, // 365 days
      name: 'monthSnapshot',
      nextEraUpdateInterval: 1000 * 60 * 60 * 24 * 7, // 7 days
    }),

    WEEK: new HistoryEra(this.user, {
      interval: 1000 * 60 * 60 * 4, // 4 hours
      maxTime: 1000 * 60 * 60 * 24 * 7 * 24, // 24 weeks
      name: 'weekSnapshot',
      nextEraUpdateInterval: 1000 * 60 * 60 * 12, // 12 hours
    }),

    DAY: new HistoryEra(this.user, {
      interval: 1000 * 60 * 60, // 60 minutes
      maxTime: 1000 * 60 * 60 * 24 * 30, // 30 days
      name: 'daySnapshot',
      nextEraUpdateInterval: 1000 * 60 * 60 * 4, // 4 hours
    }),

    HOUR: new HistoryEra(this.user, {
      interval: 1000 * 60 * 15, // 15 minutes
      maxTime: 1000 * 60 * 60 * 24, // 24 hours
      name: 'hourSnapshot',
      nextEraUpdateInterval: 1000 * 60 * 60, // 60 minutes
    }),

    THIRTY_MINUTE: new HistoryEra(this.user, {
      interval: 1000 * 20, // 20 seconds
      maxTime: 1000 * 60 * 30, // 30 minutes
      name: 'thirtyMinSnapshot',
      nextEraUpdateInterval: 1000 * 60 * 15, // 15 minutes
    }),

    FIVE_MINUTE: new HistoryEra(this.user, {
      interval: 1000 * 5, // 5 seconds
      maxTime: 1000 * 60 * 5, // 5 minutes
      name: 'fiveMinSnapshot',
      nextEraUpdateInterval: 1000 * 20, // 20 seconds
    }),
  } as const;

  constructor(...args: ConstructorParameters<typeof BaseService>) {
    super(...args);

    let nextEra: HistoryEra;
    Object.values(this.snapshots).forEach((snapshot, index) => {
      if (index === 0) {
        nextEra = snapshot;
        return;
      }
      snapshot.setNextEra(nextEra);
      nextEra = snapshot;
    });

    this.onServicesUpdated = () => {
      this.fetchCurrentTransferSummary();
    };
  }

  deferFetchTransferSummary(interval = config.torrentClientPollInterval || 2000) {
    this.pollTimeout = setTimeout(this.fetchCurrentTransferSummary, interval);
  }

  destroy() {
    if (this.pollTimeout != null) {
      clearTimeout(this.pollTimeout);
    }

    super.destroy();
  }

  fetchCurrentTransferSummary = () => {
    if (this.pollTimeout != null) {
      clearTimeout(this.pollTimeout);
    }

    this.services?.clientGatewayService
      ?.fetchTransferSummary()
      .then(this.handleFetchTransferSummarySuccess)
      .catch(this.handleFetchTransferSummaryError);
  };

  getTransferSummary() {
    return {
      id: Date.now(),
      transferSummary: this.transferSummary,
    } as const;
  }

  getHistory({snapshot}: {snapshot: HistorySnapshot}, callback: (data: TransferHistory | null, error?: Error) => void) {
    this.snapshots[snapshot]?.getData((transferSnapshots, error) => {
      if (error || transferSnapshots == null) {
        callback(null, error);
        return;
      }

      callback(
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
    });
  }

  handleFetchTransferSummarySuccess = (nextTransferSummary: TransferSummary) => {
    const summaryDiff = jsonpatch.compare(this.transferSummary, nextTransferSummary);

    this.emit('TRANSFER_SUMMARY_DIFF_CHANGE', {
      diff: summaryDiff,
      id: Date.now(),
    });

    this.errorCount = 0;
    this.transferSummary = nextTransferSummary;
    this.snapshots.FIVE_MINUTE.addData({
      upload: nextTransferSummary.upRate,
      download: nextTransferSummary.downRate,
    });

    this.deferFetchTransferSummary();

    this.emit('FETCH_TRANSFER_SUMMARY_SUCCESS');
  };

  handleFetchTransferSummaryError = () => {
    let nextInterval = config.torrentClientPollInterval || 2000;

    // If more than 2 consecutive errors have occurred, then we delay the next request.
    this.errorCount += 1;
    if (this.errorCount > 2) {
      nextInterval = Math.max(nextInterval + (this.errorCount * nextInterval) / 4, 1000 * 60);
    }

    this.deferFetchTransferSummary(nextInterval);

    this.emit('FETCH_TRANSFER_SUMMARY_ERROR');
  };
}

export default HistoryService;
