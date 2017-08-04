import BaseStore from './BaseStore';
import userConfig from '../../../../config';

const transformConfig = {
  baseURI: baseURI => {
    const shouldAddSlashEnd = !baseURI.endsWith('/');
    const shouldAddSlashStart = !baseURI.startsWith('/');

    if (shouldAddSlashEnd) {
      baseURI = `${baseURI}/`;
    }

    if (shouldAddSlashStart) {
      baseURI = `/${baseURI}`;
    }

    return baseURI;
  }
};

class ConfigStoreClass extends BaseStore {
  constructor() {
    super();

    this.storeUserConfig();
  }

  getBaseURI() {
    return this.userConfig.baseURI;
  }

  getPollInterval() {
    return this.userConfig.pollInterval;
  }

  storeUserConfig() {
    if (!userConfig) {
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
