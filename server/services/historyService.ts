import type {TransferHistory, TransferSummary} from '@shared/types/TransferData';

import config from '../../config';
import HistoryEra from '../models/HistoryEra';
import BaseService from './BaseService';

type HistoryServiceEvents = {
  TRANSFER_SUMMARY_FULL_UPDATE: (payload: {id: number; summary: TransferSummary}) => void;
  FETCH_TRANSFER_SUMMARY_SUCCESS: () => void;
  FETCH_TRANSFER_SUMMARY_ERROR: () => void;
};

class HistoryService extends BaseService<HistoryServiceEvents> {
  private errorCount = 0;
  private pollTimeout?: NodeJS.Timeout;

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

    this.onServicesUpdated = () => {
      this.fetchCurrentTransferSummary();
    };
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

  private handleFetchTransferSummarySuccess = async (nextTransferSummary: TransferSummary): Promise<void> => {
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
