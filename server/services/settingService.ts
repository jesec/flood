import Datastore from 'nedb-promises';
import path from 'path';

import type {FloodSettings} from '@shared/types/FloodSettings';

import config from '../../config';
import BaseService from './BaseService';

interface SettingRecord {
  id: string;
  data: unknown;
}

interface SettingServiceEvents {
  SETTINGS_CHANGE: (changeSettings: Partial<FloodSettings>) => void;
}

class SettingService extends BaseService<SettingServiceEvents> {
  db = Datastore.create({
    autoload: true,
    filename: path.join(config.dbPath, this.user._id, 'settings', 'settings.db'),
  });

  async get(property: keyof FloodSettings | null): Promise<Partial<FloodSettings>> {
    const docs = await this.db
      .find<SettingRecord>(
        property
          ? {
              id: property,
            }
          : {},
      )
      .exec();

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

          await this.db.update<SettingRecord>({id: property}, {$set: {data: value}}, {upsert: true});

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
