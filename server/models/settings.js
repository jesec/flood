'use strict';

let Datastore = require('nedb');

let config = require('../../config');

let settingsDB = new Datastore({
  autoload: true,
  filename: `${config.dbPath}settings/settings.db`
});

const changedKeys = {
  downloadRate: 'downRate',
  downloadTotal: 'downTotal',
  uploadRate: 'upRate',
  uploadTotal: 'upTotal',
  connectedPeers: 'peersConnected',
  totalPeers: 'peersTotal',
  connectedSeeds: 'seedsConnected',
  totalSeeds: 'seedsTotal',
  added: 'dateAdded',
  creationDate: 'dateCreated',
  trackers: 'trackerURIs'
};

/**
 * Check settings for old torrent propery keys. If the old keys exist and have
 * been assigned values, then check that the new key doesn't also exist. When
 * the new key does not exist, add the new key and assign it the old key's
 * value.
 *
 * @param  {Object} settings - the stored settings object.
 * @return {Object} - the settings object, altered if legacy keys exist.
 */
const transformLegacyKeys = settings => {
  if (
    settings.sortTorrents
    && settings.sortTorrents.property in changedKeys
  ) {
    settings.sortTorrents.property = changedKeys[
      settings.sortTorrents.property
    ];
  }

  if (settings.torrentDetails) {
    settings.torrentDetails = settings.torrentDetails.map(
      (detailItem, index) => {
        if (
          detailItem.id in changedKeys
          && !(settings.torrentDetails.some(subDetailItem => {
            return subDetailItem.id === changedKeys[detailItem.id];
          }))
        ) {
          detailItem.id = changedKeys[detailItem.id];
        }

        return detailItem;
      }
    );
  }

  if (settings.torrentListColumnWidths) {
    Object.keys(settings.torrentListColumnWidths).forEach(columnID => {
      if (
        columnID in changedKeys
        && !(changedKeys[columnID] in settings.torrentListColumnWidths)
      ) {
        settings.torrentListColumnWidths[changedKeys[columnID]]
          = settings.torrentListColumnWidths[columnID];
      }
    });
  }

  return settings;
};

let settings = {
  get: (opts, callback) => {
    let query = {};
    let settings = {};

    if (opts.property) {
      query.id = opts.property;
    }

    settingsDB.find(query).exec((err, docs) => {
      if (err) {
        callback(null, err);
        return;
      }

      docs.forEach((doc) => {
        settings[doc.id] = doc.data;
      });

      callback(transformLegacyKeys(settings));
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
