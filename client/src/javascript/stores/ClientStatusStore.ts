import {makeAutoObservable} from 'mobx';

class ClientStatusStoreClass {
  isConnected = true;

  constructor() {
    makeAutoObservable(this);
  }

  handleConnectivityStatusChange({isConnected}: {isConnected: boolean}) {
    if (this.isConnected !== isConnected) {
      this.isConnected = isConnected === true;
    }
  }
}

const ClientStatusStore = new ClientStatusStoreClass();

export default ClientStatusStore;
