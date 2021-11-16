import {createRxDatabase, addRxPlugin} from 'rxdb/plugins/core';
import Datastore from 'nedb-promises';
import fs from 'fs-extra';
import {getRxStorageLoki} from 'rxdb/plugins/lokijs';
import glob from 'glob';
import {LokiFsAdapter} from 'lokijs';
import path from 'path';

import {RxDBNoValidatePlugin} from 'rxdb/plugins/no-validate';

import config from '../../../config';

addRxPlugin(RxDBNoValidatePlugin);

const migrationError = (err?: Error) => {
  if (err) {
    console.error(err);
  }
  console.error('Migration failed. You need to reset the databases manually.');
  process.exit();
};

const migration = async () => {
  const dbPath2 = path.join(config.dbPath, 'v2');

  if (fs.existsSync(dbPath2)) {
    if (fs.existsSync(path.join(config.dbPath, 'users.db'))) {
      throw new Error('Both old and new databases exist.');
    }

    process.exit(0);
  }

  const databases = await new Promise<string[]>((resolve, reject) => {
    glob('**/*.db', {cwd: config.dbPath}, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(files);
    });
  });

  if (databases.length === 0) {
    return;
  }

  fs.mkdirSync(dbPath2);

  for await (const database of databases) {
    const db = Datastore.create({
      filename: path.resolve(config.dbPath, database),
    });

    db.persistence.stopAutocompaction();

    await db.load();

    const entries = await db.find({});

    fs.mkdirpSync(path.join(dbPath2, path.dirname(database)));

    const db2 = await createRxDatabase({
      name: path.join(dbPath2, database.slice(0, -3)),
      storage: getRxStorageLoki({
        adapter: new LokiFsAdapter(),
        autoload: true,
        autosave: true,
        autosaveCallback: () => undefined,
        autosaveInterval: 500,
      }),
    });

    const collection = await db2.addCollections({
      default: {
        schema: {
          version: 0,
          primaryKey: '_id',
          type: 'object',
          properties: {},
        },
      },
    });

    await collection.default.bulkInsert(entries);

    await collection.default.destroy();
    await db2.destroy();
  }

  const dbPath1 = path.join(config.dbPath, 'v1');

  for await (const database of databases) {
    fs.mkdirpSync(path.join(config.dbPath, path.dirname(database)));

    fs.moveSync(path.join(config.dbPath, database), path.join(dbPath1, database));

    try {
      fs.rmdirSync(path.join(dbPath1, path.dirname(database)));
    } catch {
      // do nothing.
    }
  }

  process.exit(0);
};

const run = () => migration().catch((e) => migrationError(e));

export default run;
