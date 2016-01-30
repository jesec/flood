'use strict';

let Datastore = require('nedb');

let stringUtil = require('./util/stringUtil');

const FILE_PATH = './server/db/history/';
const MAX_CLEANUP_INTERVAL = 1000 * 60 * 60; // 1 hour
const MAX_NEXT_ERA_UPDATE_INTERVAL = 1000 * 60 * 60 * 12; // 12 hours
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
    this.removeOutdatedData(this.db);

    let cleanupInterval = this.opts.maxTime;
    let nextEraUpdateInterval = this.opts.nextEraUpdateInterval;

    if (cleanupInterval === 0 || cleanupInterval > MAX_CLEANUP_INTERVAL) {
      cleanupInterval = MAX_CLEANUP_INTERVAL;
    }

    if (nextEraUpdateInterval && nextEraUpdateInterval > MAX_NEXT_ERA_UPDATE_INTERVAL) {
      nextEraUpdateInterval = MAX_NEXT_ERA_UPDATE_INTERVAL;
    }

    this.startAutoCleanup(cleanupInterval, this.db);

    if (nextEraUpdateInterval) {
      this.startNextEraUpdate(nextEraUpdateInterval, this.db);
    }
  }

  addData(data) {
    if (!this.ready) {
      console.warn('database is not ready');
      return;
    }

    console.log(`insert data in ${this.opts.name}`);

    this.db.insert({
      ts: Date.now(),
      up: data.upload,
      dn: data.download
    });
  }

  cleanup(db) {
    this.removeOutdatedData(db);
    db.persistence.compactDatafile();
  }

  hasRequiredFields(opts) {
    let requirementsMet = true;

    REQUIRED_FIELDS.forEach(function (field) {
      if (opts[field] == null) {
        console.warn(`historyEra requires ${field}`);
        requirementsMet = false;
      }
    });

    return requirementsMet;
  }

  loadDatabase(dbName) {
    let db = new Datastore({
      autoload: true,
      filename: `${FILE_PATH}${dbName}.db`
    });

    this.ready = true;

    return db;
  }

  removeOutdatedData(db) {
    if (this.opts.maxTime > 0) {
      let minTimestamp = Date.now() - this.opts.maxTime;
      db.remove({ts: {$lt: minTimestamp}}, {multi: true}, (err, numRemoved) => {
        console.log(`removed ${numRemoved} entries from ${this.opts.name}`)
      });
    }
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

      docs.forEach(function (doc) {
        downTotal += parseInt(doc.dn);
        upTotal += parseInt(doc.up);
      });

      this.opts.nextEra.addData({
        download: (downTotal / docs.length).toFixed(1),
        upload: (upTotal / docs.length).toFixed(1)
      });
    });
  }
}

module.exports = HistoryEra;
