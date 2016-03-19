import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import ClientActions from '../actions/ClientActions';
import config from '../../../../config';
import EventTypes from '../constants/EventTypes';

class TransferDataStoreClass extends BaseStore {
  constructor() {
    super();

    this.pollTransferDataID = null;
    this.transferRates = {download: [], upload: []};
    this.transferTotals = {download: null, upload: null};
    this.throttles = {download: null, upload: null};
  }

  fetchTransferData() {
    if (!this.isRequestPending('fetch-transfer-history')) {
      this.beginRequest('fetch-transfer-history');
      ClientActions.fetchTransferHistory({
        snapshot: 'fiveMin'
      });
    }

    if (!this.isRequestPending('fetch-transfer-data')) {
      this.beginRequest('fetch-transfer-data');
      ClientActions.fetchTransferData();
    }

    if (this.pollTransferDataID === null) {
      this.startPollingTransferData();
    }
  }

  getThrottles(options = {}) {
    if (options.latest) {
      return {
        download: this.throttles.download ?
          this.throttles.download[this.throttles.download.length - 1] : null,
        upload: this.throttles.upload ?
          this.throttles.upload[this.throttles.upload.length - 1] : null
      };
    }
    return this.throttles;
  }

  getTransferTotals() {
    return this.transferTotals;
  }

  getTransferRate() {
    return this.transferRate;
  }

  getTransferRates() {
    return this.transferRates;
  }

  handleSetThrottleSuccess(data) {
    this.fetchTransferData();
    this.emit(EventTypes.CLIENT_SET_THROTTLE_SUCCESS);
  }

  handleSetThrottleError(error) {
    this.emit(EventTypes.CLIENT_SET_THROTTLE_ERROR);
  }

  handleTransferDataSuccess(transferData) {
    this.transferTotals = {
      download: transferData.downloadTotal,
      upload: transferData.uploadTotal
    };

    this.transferRate = {
      download: transferData.downloadRate,
      upload: transferData.uploadRate
    };

    // add the latest download & upload throttles to the end of the array and
    // remove the first element in the array. if the arrays are empty, fill in
    // zeros the last known throttle value.
    let index = 0;
    let downloadRateThrottleHistory = Object.assign([], this.throttles.download);
    let uploadRateThrottleHistory = Object.assign([], this.throttles.upload);

    if (downloadRateThrottleHistory.length === config.maxHistoryStates) {

      downloadRateThrottleHistory.shift();
      uploadRateThrottleHistory.shift();

      downloadRateThrottleHistory.push(parseInt(transferData.downloadThrottle));
      uploadRateThrottleHistory.push(parseInt(transferData.uploadThrottle));
    } else {
      while (index < config.maxHistoryStates) {
        // we assume the throttle history has been the same for all previous
        // history states.
        uploadRateThrottleHistory[index] = parseInt(transferData.uploadThrottle);
        downloadRateThrottleHistory[index] = parseInt(transferData.downloadThrottle);
        index++;
      }
    }

    this.throttles = {
      download: downloadRateThrottleHistory,
      upload: uploadRateThrottleHistory
    };

    this.emit(EventTypes.CLIENT_TRANSFER_DATA_REQUEST_SUCCESS);
    this.resolveRequest('fetch-transfer-data');
  }

  handleTransferDataError() {
    this.emit(EventTypes.CLIENT_TRANSFER_DATA_REQUEST_ERROR);
    this.resolveRequest('fetch-transfer-data');
  }

  handleTransferHistoryError(error) {
    this.emit(EventTypes.CLIENT_TRANSFER_HISTORY_REQUEST_ERROR);
    this.resolveRequest('fetch-transfer-history');
  }

  handleTransferHistorySuccess(transferData) {
    this.transferRates = {
      download: transferData.download,
      upload: transferData.upload
    };

    this.emit(EventTypes.CLIENT_TRANSFER_HISTORY_REQUEST_SUCCESS);
    this.resolveRequest('fetch-transfer-history');
  }

  startPollingTransferData() {
    this.pollTransferDataID = setInterval(
      this.fetchTransferData.bind(this),
      config.pollInterval
    );
  }
}

let TransferDataStore = new TransferDataStoreClass();

TransferDataStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action, source} = payload;

  switch (action.type) {
    case ActionTypes.CLIENT_FETCH_TRANSFER_DATA_SUCCESS:
      TransferDataStore.handleTransferDataSuccess(action.data.transferData);
      break;
    case ActionTypes.CLIENT_FETCH_TRANSFER_DATA_ERROR:
      TransferDataStore.handleTransferDataError(action.data.error);
      break;
    case ActionTypes.CLIENT_SET_THROTTLE_SUCCESS:
      TransferDataStore.handleSetThrottleSuccess(action.data.transferData);
      break;
    case ActionTypes.CLIENT_SET_THROTTLE_ERROR:
      TransferDataStore.handleSetThrottleError(action.data.error);
      break;
    case ActionTypes.CLIENT_FETCH_TRANSFER_HISTORY_ERROR:
      TransferDataStore.handleTransferHistoryError(action.error);
      break;
    case ActionTypes.CLIENT_FETCH_TRANSFER_HISTORY_SUCCESS:
      TransferDataStore.handleTransferHistorySuccess(action.data);
      break;
  }
});

export default TransferDataStore;
