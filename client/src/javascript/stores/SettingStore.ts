import {computed, makeAutoObservable} from 'mobx';

import defaultFloodSettings from '@shared/constants/defaultFloodSettings';

import type {ClientSettings} from '@shared/types/ClientSettings';
import type {FloodSettings} from '@shared/types/FloodSettings';

class SettingStore {
  fetchStatus = {
    clientSettingsFetched: false,
    floodSettingsFetched: false,
  };

  clientSettings: ClientSettings | null = null;

  // Default settings are overridden by settings stored in database.
  floodSettings: FloodSettings = {...defaultFloodSettings};

  @computed get totalCellWidth() {
    return this.floodSettings.torrentListColumns.reduce((accumulator, {id, visible}) => {
      const width = Number(this.floodSettings.torrentListColumnWidths[id]);

      if (!visible || Number.isNaN(width)) {
        return accumulator;
      }

      return accumulator + width;
    }, 0);
  }

  constructor() {
    makeAutoObservable(this);
  }

  handleClientSettingsFetchSuccess(settings: ClientSettings) {
    this.fetchStatus.clientSettingsFetched = true;
    this.clientSettings = settings;
  }

  handleSettingsFetchSuccess(settings: Partial<FloodSettings>): void {
    this.fetchStatus.floodSettingsFetched = true;
    Object.assign(this.floodSettings, settings);
  }

  saveFloodSettings(settings: Partial<FloodSettings>) {
    Object.assign(this.floodSettings, settings);
  }

  saveClientSettings(settings: Partial<ClientSettings>) {
    if (this.clientSettings == null) {
      return;
    }

    Object.assign(this.clientSettings, settings);
  }
}

export default new SettingStore();
