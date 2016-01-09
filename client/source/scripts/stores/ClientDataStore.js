import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import ClientActions from '../actions/ClientActions';
import config from '../config/config';
import EventTypes from '../constants/EventTypes';

class ClientDataStoreClass extends BaseStore {
  constructor() {
    super();

    this.pollTransferDataID = null;
    this.transferRates = {download: [], upload: []};
    this.transferTotals = {download: null, upload: null};
    this.throttles = {download: null, upload: null};
  }

  fetchTransferData() {
    ClientActions.fetchTransferData();

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

    // this.throttles = {
    //   download: transferData.downloadThrottle,
    //   upload: transferData.uploadThrottle
    // };

    // add the latest download & upload rates to the end of the array and remove
    // the first element in the array. if the arrays are empty, fill in zeros
    // for the first n entries.
    let index = 0;
    let downloadRateHistory = Object.assign([], this.transferRates.download);
    let downloadRateThrottleHistory = Object.assign([], this.throttles.download);
    let uploadRateHistory = Object.assign([], this.transferRates.upload);
    let uploadRateThrottleHistory = Object.assign([], this.throttles.upload);

    if (uploadRateHistory.length === config.maxHistoryStates) {
      downloadRateHistory.shift();
      downloadRateThrottleHistory.shift();
      uploadRateHistory.shift();
      uploadRateThrottleHistory.shift();

      downloadRateHistory.push(parseInt(transferData.downloadRate));
      downloadRateThrottleHistory.push(parseInt(transferData.downloadThrottle));
      uploadRateHistory.push(parseInt(transferData.uploadRate));
      uploadRateThrottleHistory.push(parseInt(transferData.uploadThrottle));
    } else {
      while (index < config.maxHistoryStates) {
        // if we don't have historical values, we assume zero for the transfer
        // rate history.
        if (index < config.maxHistoryStates - 1) {
          uploadRateHistory[index] = 0;
          downloadRateHistory[index] = 0;
        } else {
          downloadRateHistory[index] = parseInt(transferData.downloadRate);
          uploadRateHistory[index] = parseInt(transferData.uploadRate);
        }

        // we assume the throttle history has been the same for all previous
        // history states.
        uploadRateThrottleHistory[index] = parseInt(transferData.uploadThrottle);
        downloadRateThrottleHistory[index] = parseInt(transferData.downloadThrottle);
        index++;
      }
    }

    this.transferRates = {
      download: downloadRateHistory,
      upload: uploadRateHistory
    };

    this.throttles = {
      download: downloadRateThrottleHistory,
      upload: uploadRateThrottleHistory
    };

    this.emit(EventTypes.CLIENT_TRANSFER_DATA_REQUEST_SUCCESS);
  }

  handleTransferDataError() {
    this.emit(EventTypes.CLIENT_TRANSFER_DATA_REQUEST_ERROR);
  }

  startPollingTransferData() {
    this.pollTransferDataID = setInterval(
      this.fetchTransferData.bind(this),
      config.pollInterval
    );
  }

  startPollingTorrents() {
    clearInterval(this.pollTransferDataID);
    this.pollTransferDataID = null;
  }

  stopPollingTorrentDetails() {
    clearInterval(this.pollTorrentDetailsIntervalID);
    this.isPollingTorrents = false;
  }
}

const ClientDataStore = new ClientDataStoreClass();

AppDispatcher.register((payload) => {
  const {action, source} = payload;

  switch (action.type) {
    case ActionTypes.CLIENT_FETCH_TRANSFER_DATA_SUCCESS:
      ClientDataStore.handleTransferDataSuccess(action.data.transferData);
      break;
    case ActionTypes.CLIENT_FETCH_TRANSFER_DATA_ERROR:
      ClientDataStore.handleTransferDataError(action.data.error);
      break;
    case ActionTypes.CLIENT_SET_THROTTLE_SUCCESS:
      ClientDataStore.handleSetThrottleSuccess(action.data.transferData);
      break;
    case ActionTypes.CLIENT_SET_THROTTLE_ERROR:
      ClientDataStore.handleSetThrottleError(action.data.error);
      break;
  }
});

export default ClientDataStore;
