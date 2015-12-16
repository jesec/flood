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
  }

  fetchTransferData() {
    ClientActions.fetchTransferData();

    if (this.pollTransferDataID === null) {
      this.startPollingTransferData();
    }
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

  handleTransferDataSuccess(transferData) {
    this.transferTotals = {
      download: transferData.downloadTotal,
      upload: transferData.uploadTotal
    };

    this.transferRate = {
      download: transferData.downloadRate,
      upload: transferData.uploadRate
    };

    // add the latest download & upload rates to the end of the array and remove
    // the first element in the array. if the arrays are empty, fill in zeros
    // for the first n entries.
    let index = 0;
    let downloadRateHistory = Object.assign([], this.transferRates.download);
    let uploadRateHistory = Object.assign([], this.transferRates.upload);

    if (uploadRateHistory.length === config.maxHistoryStates) {
      downloadRateHistory.shift();
      uploadRateHistory.shift();
      downloadRateHistory.push(parseInt(transferData.downloadRate));
      uploadRateHistory.push(parseInt(transferData.uploadRate));
    } else {
      while (index < config.maxHistoryStates) {
        if (index < config.maxHistoryStates - 1) {
          uploadRateHistory[index] = 0;
          downloadRateHistory[index] = 0;
        } else {
          downloadRateHistory[index] = parseInt(transferData.downloadRate);
          uploadRateHistory[index] = parseInt(transferData.uploadRate);
        }
        index++;
      }
    }

    this.transferRates = {
      download: downloadRateHistory,
      upload: uploadRateHistory
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
  }
});

export default ClientDataStore;
