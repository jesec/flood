import BaseStore from './BaseStore';

let disableUsersAndAuth = false;

class ConfigStoreClass extends BaseStore {
  getBaseURI(): string {
    const {pathname} = window.location;
    return pathname.substr(0, pathname.lastIndexOf('/') + 1);
  }

  getPollInterval(): number {
    return Number(process.env.POLL_INTERVAL) || 5000;
  }

  getDisableAuth(): boolean {
    return disableUsersAndAuth;
  }

  setDisableAuth(val: boolean): void {
    disableUsersAndAuth = val;
  }
}

export default new ConfigStoreClass();
