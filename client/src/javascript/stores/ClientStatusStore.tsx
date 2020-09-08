import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseStore from './BaseStore';

interface ClientStatus {
  isConnected: boolean;
}

class ClientStatusStoreClass extends BaseStore {
  isConnected: ClientStatus['isConnected'] = false;

  getIsConnected(): ClientStatus['isConnected'] {
    return this.isConnected;
  }

  handleConnectivityStatusChange({isConnected}: {isConnected: ClientStatus['isConnected']}) {
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
    ClientStatusStore.handleConnectivityStatusChange(action.data as ClientStatus);
  }
});

export default ClientStatusStore;
