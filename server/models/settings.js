'use strict';

const _ = require('lodash');
const Datastore = require('nedb');
const path = require('path');

const config = require('../../config');

const databases = new Map();

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

const removedKeys = ['freeDiskSpace'];

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
    settings.torrentDetails = settings.torrentDetails.reduce(
      (accumulator, detailItem, index) => {
        if (
          detailItem && detailItem.id in changedKeys
          && !(settings.torrentDetails.some(subDetailItem => {
            return subDetailItem.id === changedKeys[detailItem.id];
          }))
        ) {
          detailItem.id = changedKeys[detailItem.id];
        }

        if (!removedKeys.includes(detailItem.id)) {
          accumulator.push(detailItem);
        }

        return accumulator;
      },
      []
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

function getDb(user) {
  const userId = user._id;

  if (databases.has(userId)) {
    return databases.get(userId);
  }

  const database = new Datastore({
    autoload: true,
    filename: path.join(config.dbPath, userId, 'settings', 'settings.db')
  });

  databases.set(userId, database);

  return database;
};

const settings = {
  get: (user, opts, callback) => {
    let query = {};
    let settings = {};

    if (opts.property) {
      query.id = opts.property;
    }

    getDb(user).find(query).exec((err, docs) => {
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

  set: (user, payloads, callback = _.noop) => {
    let docsResponse = [];

    if (!Array.isArray(payloads)) {
      payloads = [payloads];
    }

    if (payloads && payloads.length) {
      payloads.forEach((payload, index) => {
        getDb(user).update({id: payload.id}, {$set: {data: payload.data}}, {upsert: true}, (err, docs) => {
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
    } else {
      callback();
    }
  }
}

module.exports = settings;
