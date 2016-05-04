'use strict';

let Datastore = require('nedb');

let config = require('../../config');

let uiDB = new Datastore({
  autoload: true,
  filename: `${config.dbPath}uiSettings.db`
});

uiDB.persistence.setAutocompactionInterval(config.dbCleanInterval);

let getDbResponseHandler = (callback) => {
  return (error, docs) => {
    if (error) {
      callback(null, error);
      return;
    }

    if (Array.isArray(docs)) {
      callback(docs[0]);
      return;
    }

    callback(docs);
    return;
  };
};

let uiSettings = {
  get: (type, callback) => {
    uiDB.find({type}, getDbResponseHandler(callback));
  },

  set: (payload, callback) => {
    let newLocationData = Object.assign({}, {type: payload.type}, {data: payload.data});
    uiDB.update({type: payload.type, data: payload.data}, getDbResponseHandler(callback));
  },

  getLatestTorrentLocation: (callback) => {
    try {
      uiDB.find({type: 'location'}, getDbResponseHandler(callback));
    } catch (e) { console.log(e); }
  },

  getSortProps: (callback) => {
    uiDB.find({type: 'sort'}, getDbResponseHandler(callback));
  },

  setLatestTorrentLocation: (data, callback) => {
    let newLocationData = Object.assign({}, {type: 'location'}, {path: data.destination});
    uiDB.update({type: 'location'}, newLocationData, {upsert: true}, getDbResponseHandler(callback));
  },

  setSortProps: (sortProps, callback) => {
    let newSortPropData = Object.assign({}, {type: 'sort'}, sortProps);
    uiDB.update({type: 'sort'}, newSortPropData, {upsert: true}, getDbResponseHandler(callback));
  }
}

module.exports = uiSettings;
