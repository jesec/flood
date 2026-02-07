import path from 'node:path';

import Datastore from '@seald-io/nedb';
import type {FloodSettings} from '@shared/types/FloodSettings';

import config from '../../config';
import BaseService from './BaseService';

interface SettingRecord {
  id: string;
  data: unknown;
}

type SettingServiceEvents = {
  SETTINGS_CHANGE: (changeSettings: Partial<FloodSettings>) => void;
};

class SettingService extends BaseService<SettingServiceEvents> {
  db = new Datastore({
    autoload: true,
    filename: path.join(config.dbPath, this.user._id, 'settings', 'settings.db'),
  });

  constructor(...args: ConstructorParameters<typeof BaseService>) {
    super(...args);
    this.db.setAutocompactionInterval(config.dbCleanInterval);
  }

  async destroy(drop: boolean) {
    if (drop) {
      await this.db.dropDatabaseAsync();
    }

    return super.destroy(drop);
  }

  async get(property: keyof FloodSettings | null): Promise<Partial<FloodSettings>> {
    const docs = await this.db
      .findAsync<SettingRecord>(
        property
          ? {
              id: property,
            }
          : {},
      )
      .execAsync();

    return Object.assign(
      {},
      ...docs.map((doc) => {
        return {
          [doc.id]: doc.data,
        };
      }),
    );
  }

  async set(changedSettings: Partial<FloodSettings>): Promise<Partial<FloodSettings>> {
    const savedSettings: typeof changedSettings = {};

    if (changedSettings) {
      await Promise.all(
        Object.keys(changedSettings).map(async (key) => {
          const property = key as keyof FloodSettings;
          const value = changedSettings[property];

          await this.db.updateAsync<SettingRecord>({id: property}, {$set: {data: value}}, {upsert: true});

          Object.assign(savedSettings, {
            [property]: value,
          });
        }),
      );
    }

    this.emit('SETTINGS_CHANGE', savedSettings);
    return savedSettings;
  }
}

export default SettingService;
