import {makeAutoObservable} from 'mobx';

class ClientStatusStore {
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

export default new ClientStatusStore();
