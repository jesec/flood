import BaseStore from './BaseStore';

let disableUsersAndAuth = false;

class ConfigStoreClass extends BaseStore {
  getBaseURI() {
    const {pathname} = window.location;
    return pathname.substr(0, pathname.lastIndexOf('/') + 1);
  }

  getPollInterval() {
    return process.env.POLL_INTERVAL || 5000;
  }

  getDisableAuth() {
    return disableUsersAndAuth;
  }

  setDisableAuth(val) {
    disableUsersAndAuth = val;
  }
}

export default new ConfigStoreClass();
