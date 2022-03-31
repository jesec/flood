import {makeAutoObservable} from 'mobx';

import type {TransferDirection, TransferHistory, TransferSummary} from '@shared/types/TransferData';

export const TRANSFER_DIRECTIONS: Readonly<Array<TransferDirection>> = ['download', 'upload'] as const;

class TransferDataStore {
  transferRates: TransferHistory = {
    download: [0, 0],
    upload: [0, 0],
    timestamps: [Date.now() - 5000, Date.now()],
  };

  transferSummary: TransferSummary = {
    downRate: 0,
    downTotal: 0,
    upRate: 0,
    upTotal: 0,
  };

  constructor() {
    makeAutoObservable(this);
  }

  appendCurrentTransferRateToHistory() {
    const download = this.transferRates.download.slice();
    const upload = this.transferRates.upload.slice();
    const timestamps = this.transferRates.timestamps.slice();

    download.push(this.transferSummary.downRate);
    upload.push(this.transferSummary.upRate);
    timestamps.push(Date.now());

    if (timestamps.length > 30) {
      download.shift();
      upload.shift();
      timestamps.shift();
    }

    this.transferRates = {download, upload, timestamps};
  }

  handleFetchTransferHistorySuccess(transferData: TransferHistory) {
    if (transferData.timestamps.length > 1) {
      this.transferRates = transferData;
    }
  }

  handleTransferSummaryFullUpdate(transferSummary: TransferSummary) {
    this.transferSummary = transferSummary;
    this.appendCurrentTransferRateToHistory();
  }
}

export default new TransferDataStore();
