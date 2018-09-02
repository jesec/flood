import ActionTypes from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';
import EventTypes from '../constants/EventTypes';

class ClientStatusStoreClass extends BaseStore {
  constructor() {
    super();
    this.errorCount = 0;
    this.isConnected = null;
  }

  getIsConnected() {
    return this.isConnected === true;
  }

  handleConnectivityStatusChange({isConnected}) {
    if (this.isConnected !== isConnected) {
      this.isConnected = isConnected;
      this.emit(EventTypes.CLIENT_CONNECTION_STATUS_CHANGE);
    }
  }
}

const ClientStatusStore = new ClientStatusStoreClass();

ClientStatusStore.dispatcherID = AppDispatcher.register((payload) => {
  const { action } = payload;

  switch (action.type) {
    case ActionTypes.CLIENT_CONNECTIVITY_STATUS_CHANGE:
      ClientStatusStore.handleConnectivityStatusChange(action.data);
      break;
    default:
      break;
  }
});

export default ClientStatusStore;
