import BaseStore from './BaseStore';

let disableUsersAndAuth = false;
let isHTTPUser = false;

class ConfigStore extends BaseStore {
  static getBaseURI(): string {
    const {pathname} = window.location;
    return pathname.substr(0, pathname.lastIndexOf('/') + 1);
  }

  static getPollInterval(): number {
    return Number(process.env.POLL_INTERVAL) || 5000;
  }

  static getDisableAuth(): boolean {
    return disableUsersAndAuth;
  }

  static getIsHTTPUser(): boolean {
    return isHTTPUser;
  }

  static setDisableAuth(val: boolean): void {
    disableUsersAndAuth = val;
  }

  static setIsHTTPUser(val: boolean): void {
    isHTTPUser = val;
  }
}

export default ConfigStore;
