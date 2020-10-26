import {makeAutoObservable} from 'mobx';

class ConfigStore {
  baseURI = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/') + 1);
  disableAuth = false;
  pollInterval = 2000;

  constructor() {
    makeAutoObservable(this);
  }

  setDisableAuth(val: boolean): void {
    this.disableAuth = val;
  }
}

export default new ConfigStore();
