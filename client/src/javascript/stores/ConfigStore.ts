import {makeAutoObservable} from 'mobx';

import type {AuthVerificationPreloadConfigs} from '@shared/schema/api/auth';

class ConfigStore {
  baseURI = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/') + 1);
  disableAuth = false;
  pollInterval = 2000;

  constructor() {
    makeAutoObservable(this);
  }

  handlePreloadConfigs({disableAuth, pollInterval}: AuthVerificationPreloadConfigs) {
    this.disableAuth = disableAuth != null ? disableAuth : false;
    this.pollInterval = pollInterval || 2000;
  }
}

export default new ConfigStore();
