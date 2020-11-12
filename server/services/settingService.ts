import Datastore from 'nedb';
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
  db = this.loadDatabase();

  loadDatabase(): Datastore<SettingRecord> {
    const userId = this.user._id;

    const database = new Datastore<SettingRecord>({
      autoload: true,
      filename: path.join(config.dbPath, userId, 'settings', 'settings.db'),
    });

    return database;
  }

  async get(property: keyof FloodSettings | null): Promise<Partial<FloodSettings>> {
    return new Promise((resolve, reject) => {
      this.db
        .find(
          property
            ? {
                id: property,
              }
            : {},
        )
        .exec(async (err, docs) => {
          if (err) {
            reject(err);
          }

          resolve(
            Object.assign(
              {},
              ...(await Promise.all(
                docs.map(async (doc) => {
                  return {
                    [doc.id]: doc.data,
                  };
                }),
              )),
            ),
          );
        });
    });
  }

  async set(changedSettings: Partial<FloodSettings>): Promise<Partial<FloodSettings>> {
    const savedSettings: typeof changedSettings = {};

    if (changedSettings) {
      let error: Error | null = null;

      await Promise.all(
        Object.keys(changedSettings).map((key) => {
          return new Promise<keyof FloodSettings>((resolve, reject) => {
            const property = key as keyof FloodSettings;
            return this.db.update(
              {id: property},
              {$set: {data: changedSettings[property]}},
              {upsert: true},
              (err: Error | null) => {
                if (err) {
                  reject(err);
                  return;
                }
                resolve(property);
              },
            );
          })
            .then((property) => {
              Object.assign(savedSettings, {
                [property]: changedSettings[property],
              });
            })
            .catch((e) => {
              error = e;
            });
        }),
      );

      if (error) {
        return Promise.reject(error);
      }
    }

    this.emit('SETTINGS_CHANGE', savedSettings);
    return savedSettings;
  }
}

export default SettingService;
