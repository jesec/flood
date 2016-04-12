'use strict';

let Datastore = require('nedb');

let client = require('./client');
let config = require('../../config');
let HistoryEra = require('./HistoryEra');

let settingsDB = new Datastore({
  autoload: true,
  filename: `${config.dbPath}settings/settings.db`
});

let history = {
  get: (opts, callback) => {
    settingsDB.find({id: 'settings'}).exec((err, docs) => {
        if (err) {
          callback(null, err);
          return;
        }
        callback(docs[0]);
      }
    );
  },

  set: (settings, callback) => {
    settingsDB.update({id: 'settings'}, {$set: settings}, {upsert: true}, (err, docs) => {
      if (err) {
        callback(null, err);
        return;
      }
      callback(docs);
    });
  }
}

module.exports = history;
