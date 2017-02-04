import BaseStore from './BaseStore';

const transformConfig = {
  baseURI: baseURI => baseURI.replace(/\/$/, '')
};

class ConfigStoreClass extends BaseStore {
  constructor() {
    super();

    this.storeServerConfig();
  }

  getBaseURI() {
    return this.userConfig.baseURI;
  }

  getMaxHistoryStates() {
    return this.userConfig.maxHistoryStates;
  }

  getPollInterval() {
    return this.userConfig.pollInterval;
  }

  storeServerConfig() {
    const serverConfig = global.floodConfig;

    this.userConfig = Object.keys(serverConfig).reduce((accumulator, key) => {
      const transformer = transformConfig[key];
      const value = serverConfig[key];

      if (transformer) {
        accumulator[key] = transformer(value);
      } else {
        accumulator[key] = value;
      }

      return accumulator;
    }, {});
  }
}

export default new ConfigStoreClass();
