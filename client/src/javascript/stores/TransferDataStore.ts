import type {
  TransferDirection,
  TransferHistory,
  TransferSummary,
  TransferSummaryDiff,
} from '@shared/types/TransferData';

import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';

export const TRANSFER_DIRECTIONS: Readonly<Array<TransferDirection>> = ['download', 'upload'] as const;

class TransferDataStoreClass extends BaseStore {
  transferRates: TransferHistory = {download: [], upload: [], timestamps: []};
  transferSummary: TransferSummary = {
    downRate: 0,
    downThrottle: 0,
    downTotal: 0,
    upRate: 0,
    upThrottle: 0,
    upTotal: 0,
  };

  appendCurrentTransferRateToHistory() {
    // TODO: Find a better way to append the current transfer rate. This
    // just replaces the last transfer rate values from the history service with
    // the most recent speed.
    if (this.transferRates.download.length > 0) {
      this.transferRates.download[this.transferRates.download.length - 1] = this.transferSummary.downRate;
      this.transferRates.upload[this.transferRates.upload.length - 1] = this.transferSummary.upRate;
    }

    this.emit('CLIENT_TRANSFER_HISTORY_REQUEST_SUCCESS');
  }

  getTransferSummary() {
    return this.transferSummary;
  }

  getTransferRates() {
    return this.transferRates;
  }

  handleFetchTransferHistoryError() {
    this.emit('CLIENT_TRANSFER_HISTORY_REQUEST_ERROR');
  }

  handleFetchTransferHistorySuccess(transferData: TransferHistory) {
    this.transferRates = transferData;
    this.emit('CLIENT_TRANSFER_HISTORY_REQUEST_SUCCESS');
  }

  handleTransferSummaryDiffChange(diff: TransferSummaryDiff) {
    diff.forEach((change) => {
      if (change.action === 'ITEM_REMOVED') {
        delete this.transferSummary[change.data];
      } else {
        this.transferSummary = {
          ...this.transferSummary,
          ...change.data,
        };
      }
    });

    this.appendCurrentTransferRateToHistory();
    this.emit('CLIENT_TRANSFER_SUMMARY_CHANGE');
  }

  handleTransferSummaryFullUpdate(transferSummary: TransferSummary) {
    this.transferSummary = transferSummary;

    this.appendCurrentTransferRateToHistory();
    this.emit('CLIENT_TRANSFER_SUMMARY_CHANGE');
  }
}

const TransferDataStore = new TransferDataStoreClass();

TransferDataStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action} = payload;

  switch (action.type) {
    case 'TRANSFER_SUMMARY_DIFF_CHANGE':
      TransferDataStore.handleTransferSummaryDiffChange(action.data);
      break;
    case 'TRANSFER_SUMMARY_FULL_UPDATE':
      TransferDataStore.handleTransferSummaryFullUpdate(action.data);
      break;
    case 'TRANSFER_HISTORY_FULL_UPDATE':
      TransferDataStore.handleFetchTransferHistorySuccess(action.data);
      break;
    default:
      break;
  }
});

export default TransferDataStore;
