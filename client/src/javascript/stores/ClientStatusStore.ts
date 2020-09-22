import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';

class ClientStatusStoreClass extends BaseStore {
  isConnected = true;

  getIsConnected(): boolean {
    return this.isConnected;
  }

  handleConnectivityStatusChange({isConnected}: {isConnected: boolean}) {
    if (this.isConnected !== isConnected) {
      this.isConnected = isConnected === true;
      this.emit('CLIENT_CONNECTION_STATUS_CHANGE');
    }
  }
}

const ClientStatusStore = new ClientStatusStoreClass();

ClientStatusStore.dispatcherID = AppDispatcher.register((payload) => {
  const {action} = payload;

  if (action.type === 'CLIENT_CONNECTIVITY_STATUS_CHANGE') {
    ClientStatusStore.handleConnectivityStatusChange(action.data);
  }
});

export default ClientStatusStore;
