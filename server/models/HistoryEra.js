'use strict';

let Datastore = require('nedb');

let config = require('../../config');
let stringUtil = require('../../shared/util/stringUtil');

const MAX_NEXT_ERA_UPDATE_INTERVAL = 1000 * 60 * 60 * 12; // 12 hours
const CUMULATIVE_DATA_BUFFER_DIFF = 500; // 500 miliseconds
const REQUIRED_FIELDS = ['interval', 'maxTime', 'name'];

class HistoryEra {
  constructor(opts) {
    opts = opts || {};

    this.ready = false;

    if (!this.hasRequiredFields(opts)) {
      return;
    }

    this.data = [];
    this.opts = opts;
    this.startedAt = Date.now();

    this.db = this.loadDatabase(this.opts.name);
    this.setLastUpdate(this.db);
    this.removeOutdatedData(this.db);

    let cleanupInterval = this.opts.maxTime;
    let nextEraUpdateInterval = this.opts.nextEraUpdateInterval;

    if (cleanupInterval === 0 || cleanupInterval > config.dbCleanInterval) {
      cleanupInterval = config.dbCleanInterval;
    }

    if (nextEraUpdateInterval && nextEraUpdateInterval > MAX_NEXT_ERA_UPDATE_INTERVAL) {
      nextEraUpdateInterval = MAX_NEXT_ERA_UPDATE_INTERVAL;
    }

    if (nextEraUpdateInterval) {
      this.startNextEraUpdate(nextEraUpdateInterval, this.db);
    }

    this.startAutoCleanup(cleanupInterval, this.db);
  }

  addData(data) {
    if (!this.ready) {
      console.error('database is not ready');
      return;
    }

    let currentTime = Date.now();

    if (currentTime - this.lastUpdate >= this.opts.interval - CUMULATIVE_DATA_BUFFER_DIFF) {
      this.lastUpdate = currentTime;

      this.db.insert({
        ts: currentTime,
        up: Number(data.upload),
        dn: Number(data.download)
      });
    } else {
      this.db.find({ts: this.lastUpdate}, (err, docs) => {
        if (docs.length !== 0) {
          let doc = docs[0];
          let numUpdates = Number(doc.num || 1);
          let currentDownAvg = Number(doc.dn);
          let currentUpAvg = Number(doc.up);

          let downAvg = ((currentDownAvg * numUpdates + Number(data.download)) / (numUpdates + 1)).toFixed(1);
          let upAvg = ((currentUpAvg * numUpdates + Number(data.upload)) / (numUpdates + 1)).toFixed(1);

          // TODO: Remove this nonsense, I think this bug is resolved.
          if (downAvg == null || upAvg == null) {
            console.error('\n\n');
            console.error('Warning: null values set in database!');
            console.error(`DB: ${this.opts.name}`);
            console.error(`numUpdates: ${numUpdates}\ncurrentDownAvg: ${currentDownAvg}\ncurrentUpAvg: ${currentUpAvg}\ndownAvg: ${downAvg}\nupAvg: ${upAvg}`);
            console.error('\n\n');
          }

          this.db.update(
            {
              ts: this.lastUpdate
            },
            {
              ts: this.lastUpdate,
              up: Number(upAvg),
              dn: Number(downAvg),
              num: numUpdates + 1
            }
          );
        }
      });
    }
  }

  cleanup(db) {
    this.removeOutdatedData(db);
    db.persistence.compactDatafile();
  }

  getData(opts, callback) {
    let minTimestamp = Date.now() - this.opts.maxTime;

    this.db.find({ts: {$gte: minTimestamp}})
      .sort({ts: 1})
      .exec((err, docs) => {
        if (err) {
          callback(null, err);
          return;
        }

        callback(docs);
      }
    );
  }

  hasRequiredFields(opts) {
    let requirementsMet = true;

    REQUIRED_FIELDS.forEach((field) => {
      if (opts[field] == null) {
        console.error(`HistoryEra requires ${field}`);
        requirementsMet = false;
      }
    });

    return requirementsMet;
  }

  loadDatabase(dbName) {
    let db = new Datastore({
      autoload: true,
      filename: `${config.dbPath}history/${dbName}.db`
    });

    this.ready = true;
    return db;
  }

  removeOutdatedData(db) {
    if (this.opts.maxTime > 0) {
      let minTimestamp = Date.now() - this.opts.maxTime;
      db.remove({ts: {$lt: minTimestamp}}, {multi: true});
    }
  }

  setLastUpdate(db) {
    let lastUpdate = 0;

    db.find({}, (err, docs) => {
      docs.forEach((doc) => {
        if (doc.ts > lastUpdate) {
          lastUpdate = doc.ts;
        }
      });
      this.lastUpdate = lastUpdate;
    });
  }

  startAutoCleanup(interval, db) {
    this.autoCleanupInterval = setInterval(
      this.cleanup.bind(this, db), interval
    );
  }

  startNextEraUpdate(interval, currentDB, nextDB) {
    this.nextEraUpdateInterval = setInterval(
      this.updateNextEra.bind(this, currentDB, nextDB), interval
    );
  }

  stopAutoCleanup() {
    clearInterval(this.autoCleanupInterval);
    this.autoCleanupInterval = null;
  }

  stopNextEraUpdate(interval, db) {
    clearInterval(this.nextEraUpdateInterval);
    this.nextEraUpdateInterval = null;
  }

  updateNextEra(currentDB, nextDB) {
    let minTimestamp = Date.now() - this.opts.nextEraUpdateInterval;
    currentDB.find({ts: {$gte: minTimestamp}}, (err, docs) => {
      let downTotal = 0;
      let upTotal = 0;

      docs.forEach((doc) => {
        downTotal += Number(doc.dn);
        upTotal += Number(doc.up);
      });

      this.opts.nextEra.addData({
        download: Number(downTotal / docs.length).toFixed(1),
        upload: Number(upTotal / docs.length).toFixed(1)
      });
    });
  }
}

module.exports = HistoryEra;
