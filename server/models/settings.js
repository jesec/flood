'use strict';

let Datastore = require('nedb');

let config = require('../../config');

let settingsDB = new Datastore({
  autoload: true,
  filename: `${config.dbPath}settings/settings.db`
});

let settings = {
  get: (opts, callback) => {
    let query = {};
    let foundSettings = {};

    if (opts.property) {
      query.id = opts.property;
    }

    settingsDB.find(query).exec((err, docs) => {
      if (err) {
        callback(null, err);
        return;
      }

      docs.forEach((doc) => {
        foundSettings[doc.id] = doc.data;
      });

      if (foundSettings.sortTorrents &&
        foundSettings.sortTorrents.property === 'added') {
        foundSettings.sortTorrents.property = 'dateAdded';
      }

      callback(foundSettings);
    });
  },

  set: (payloads, callback) => {
    let docsResponse = [];

    if (!Array.isArray(payloads)) {
      payloads = [payloads];
    }

    payloads.forEach((payload, index) => {
      settingsDB.update({id: payload.id}, {$set: {data: payload.data}}, {upsert: true}, (err, docs) => {
        docsResponse.push(docs);
        if (index + 1 === payloads.length) {
          if (err) {
            callback(null, err);
            return;
          }
          callback(docsResponse);
          return;
        }
      });
    });
  }
};

module.exports = settings;
