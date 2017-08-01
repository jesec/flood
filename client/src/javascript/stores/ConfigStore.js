import BaseStore from './BaseStore';

const transformConfig = {
  basePath: basePath => {
    const shouldAddSlashEnd = !basePath.endsWith('/');
    const shouldAddSlashStart = !basePath.startsWith('/');

    if (shouldAddSlashEnd) {
      basePath = `${basePath}/`;
    }

    if (shouldAddSlashStart) {
      basePath = `/${basePath}`;
    }

    return basePath;
  }
};

class ConfigStoreClass extends BaseStore {
  constructor() {
    super();

    this.storeUserConfig();
  }

  getBaseURI() {
    return this.userConfig.basePath;
  }

  getMaxHistoryStates() {
    return this.userConfig.maxHistoryStates;
  }

  getPollInterval() {
    return this.userConfig.pollInterval;
  }

  storeUserConfig() {
    const userConfig = global.floodConfig;

    if (!global.floodConfig || Object.keys(userConfig).length === 0) {
      throw new Error('Global Flood config was not found.');
    }

    this.userConfig = Object.keys(userConfig).reduce((accumulator, key) => {
      const transformer = transformConfig[key];
      const value = userConfig[key];

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
