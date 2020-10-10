import Datastore from 'nedb';
import noop from 'lodash/noop';
import path from 'path';

import type {UserInDatabase} from '@shared/schema/Auth';

import config from '../../config';

interface SettingsRecord {
  id: string;
  data: unknown;
}

const databases = new Map();

function getDb(user: UserInDatabase): Datastore<SettingsRecord> {
  const userId = user._id;

  if (databases.has(userId)) {
    return databases.get(userId);
  }

  const database = new Datastore<SettingsRecord>({
    autoload: true,
    filename: path.join(config.dbPath, userId, 'settings', 'settings.db'),
  });

  databases.set(userId, database);

  return database;
}

const settings = {
  get: (
    user: UserInDatabase,
    opts: {property?: string},
    callback: (data: Record<string, unknown> | null, error?: Error) => void,
  ) => {
    const query: {id?: string} = {};
    const settingsToReturn: Record<string, unknown> = {};

    if (opts.property) {
      query.id = opts.property;
    }

    getDb(user)
      .find(query)
      .exec((err, docs) => {
        if (err) {
          callback(null, err);
          return;
        }

        docs.forEach((doc) => {
          settingsToReturn[doc.id] = doc.data;
        });

        callback(settingsToReturn);
      });
  },

  set: (
    user: UserInDatabase,
    payloads: Array<SettingsRecord>,
    callback: (data?: Array<Array<SettingsRecord>> | null, error?: Error) => void = noop,
  ) => {
    const docsResponse: Array<Array<SettingsRecord>> = [];

    if (payloads && payloads.length) {
      let error;
      payloads.forEach((payload) => {
        getDb(user).update(
          {id: payload.id},
          {$set: {data: payload.data}},
          {upsert: true},
          (err: Error | null, _numberOfUpdated: number, docs: Array<SettingsRecord>, _upsert: boolean) => {
            docsResponse.push(docs);
            if (err) {
              error = err;
            }
          },
        );
      });
      if (error) {
        callback(null, error);
      } else {
        callback(docsResponse);
      }
    } else {
      callback();
    }
  },
};

export default settings;
