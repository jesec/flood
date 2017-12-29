import BaseStore from './BaseStore';

class ConfigStoreClass extends BaseStore {
  getBaseURI() {
    return process.env.BASE_URI;
  }

  getPollInterval() {
    return process.env.POLL_INTERVAL || 5000;
  }
}

export default new ConfigStoreClass();
