import BaseStore from './BaseStore';

class ConfigStoreClass extends BaseStore {
  getBaseURI() {
    const {pathname} = window.location;
    return pathname.substr(0, pathname.lastIndexOf('/') + 1);
  }

  getPollInterval() {
    return process.env.POLL_INTERVAL || 5000;
  }

  getDisableAuth() {
    return process.env.DISABLE_AUTH || false;
  }
}

export default new ConfigStoreClass();
