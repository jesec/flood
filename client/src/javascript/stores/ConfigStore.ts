import {computed, makeAutoObservable} from 'mobx';

import type {AuthMethod} from '@shared/schema/Auth';
import type {AuthVerificationPreloadConfigs} from '@shared/schema/api/auth';

const queryUserPreferDark = (): boolean | null => {
  const preference = window.localStorage.getItem('userPreferDark');

  if (preference != null) {
    if (preference === 'true') {
      return true;
    }

    if (preference === 'false') {
      return false;
    }
  }

  return null;
};

class ConfigStore {
  baseURI = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/') + 1);
  authMethod: AuthMethod = 'default';
  pollInterval = 2000;

  isSmallScreen = false;

  isSystemPreferDark = false;
  isUserPreferDark: boolean | null = queryUserPreferDark();
  @computed get isPreferDark(): boolean {
    return this.isUserPreferDark ?? this.isSystemPreferDark;
  }

  constructor() {
    makeAutoObservable(this);
  }

  setSmallScreen(preference: boolean): void {
    this.isSmallScreen = preference;
  }

  setSystemPreferDark(preference: boolean): void {
    this.isSystemPreferDark = preference;
  }

  setUserPreferDark(preference: boolean | null): void {
    this.isUserPreferDark = preference;
    if (preference == null) {
      window.localStorage.removeItem('userPreferDark');
    } else {
      window.localStorage.setItem('userPreferDark', `${preference}`);
    }
  }

  handlePreloadConfigs({authMethod, pollInterval}: AuthVerificationPreloadConfigs) {
    this.authMethod = authMethod || 'default';
    this.pollInterval = pollInterval || 2000;
  }
}

export default new ConfigStore();
