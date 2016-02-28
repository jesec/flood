'use strict';

let Datastore = require('nedb');

let config = require('../../config');

let uiDB = new Datastore({
  autoload: true,
  filename: `${config.databasePath}uiSettings.db`
});

uiDB.persistence.setAutocompactionInterval(config.uiDatabaseCleanInterval);

let uiSettings = {
  getLatestTorrentLocation: function(callback) {
    uiDB.find({type: 'location'}, function(error, docs) {
      if (error) {
        callback(null, error);
        return;
      }

      if (docs.length) {
        callback(docs[0]);
      }
    });
  },

  getSortProps: function(callback) {
    uiDB.find({type: 'sort'}, function(error, docs) {
      if (error) {
        callback(null, error);
        return;
      }

      if (docs.length) {
        callback(docs[0]);
      }
    });
  },

  setLatestTorrentLocation: function(data, callback) {
    let newLocationData = Object.assign({}, {type: 'location'}, {path: data.destination});
    uiDB.update({type: 'location'}, newLocationData, {upsert: true}, function (error, docs) {
      if (error) {
        callback(null, error);
        return;
      }

      if (docs.length) {
        callback(docs);
      }
    });
  },

  setSortProps: function(sortProps, callback) {
    let newSortPropData = Object.assign({}, {type: 'sort'}, sortProps);
    uiDB.update({type: 'sort'}, newSortPropData, {upsert: true}, function (error, docs) {
      if (error) {
        callback(null, error);
        return;
      }

      if (docs.length) {
        callback(docs);
      }
    });
  }
}

module.exports = uiSettings;
