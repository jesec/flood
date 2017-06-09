import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import ConfigStore from './ConfigStore';
import diffActionTypes from '../../../shared/constants/diffActionTypes';
import EventTypes from '../constants/EventTypes';
import FloodActions from '../actions/FloodActions';

const pollInterval = ConfigStore.getPollInterval();
const maxHistoryStates = ConfigStore.getMaxHistoryStates();

class TransferDataStoreClass extends BaseStore {
  constructor() {
    super();

    this.transferRates = {download: [], upload: [], timestamps: []};
    this.transferSummary = {};
  }

  appendCurrentTransferRateToHistory() {
    // TODO: Find a better way to append the current transfer rate. This
    // just replaces the last transfer rate values from the history service with
    // the most recent speed.
    if (this.transferRates.download.length > 0) {
      this.transferRates.download[this.transferRates.download.length - 1] = (
        this.transferSummary.downRate
      );
      this.transferRates.upload[this.transferRates.upload.length - 1] = (
        this.transferSummary.upRate
      );
    }

    this.emit(EventTypes.CLIENT_TRANSFER_HISTORY_REQUEST_SUCCESS);
  }

  getTransferSummary() {
    return this.transferSummary;
  }

  getTransferRates() {
    return this.transferRates;
  }

  handleSetThrottleSuccess(data) {
    this.emit(EventTypes.CLIENT_SET_THROTTLE_SUCCESS);
  }

  handleSetThrottleError(error) {
    this.emit(EventTypes.CLIENT_SET_THROTTLE_ERROR);
  }

  handleFetchTransferHistoryError(error) {
    this.emit(EventTypes.CLIENT_TRANSFER_HISTORY_REQUEST_ERROR);
  }

  handleFetchTransferHistorySuccess(transferData) {
    this.transferRates = transferData;
    this.emit(EventTypes.CLIENT_TRANSFER_HISTORY_REQUEST_SUCCESS);
  }

  handleTransferSummaryDiffChange(diff) {
    diff.forEach(change => {
      if (change.action === diffActionTypes.ITEM_REMOVED) {
        delete this.transferSummary[change.data];
      } else {
        this.transferSummary = {
          ...this.transferSummary,
          ...change.data
        };
      }
    });

    this.appendCurrentTransferRateToHistory();
    this.emit(EventTypes.CLIENT_TRANSFER_SUMMARY_CHANGE);
  }

  handleTransferSummaryFullUpdate(transferSummary) {
    this.transferSummary = transferSummary;

    this.appendCurrentTransferRateToHistory();
    this.emit(EventTypes.CLIENT_TRANSFER_SUMMARY_CHANGE);
  }
}

let TransferDataStore = new TransferDataStoreClass();

TransferDataStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action, source} = payload;

  switch (action.type) {
    case ActionTypes.TRANSFER_SUMMARY_DIFF_CHANGE:
      TransferDataStore.handleTransferSummaryDiffChange(action.data);
      break;
    case ActionTypes.TRANSFER_SUMMARY_FULL_UPDATE:
      TransferDataStore.handleTransferSummaryFullUpdate(action.data);
      break;
    case ActionTypes.CLIENT_SET_THROTTLE_SUCCESS:
      TransferDataStore.handleSetThrottleSuccess(action.data.transferData);
      break;
    case ActionTypes.CLIENT_SET_THROTTLE_ERROR:
      TransferDataStore.handleSetThrottleError(action.data.error);
      break;
    case ActionTypes.TRANSFER_HISTORY_FULL_UPDATE:
      TransferDataStore.handleFetchTransferHistorySuccess(action.data);
      break;
  }
});

export default TransferDataStore;
