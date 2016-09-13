'use strict';

let _ = require('lodash');
let Datastore = require('nedb');

let client = require('./client');
let config = require('../../config');
let Feed = require('./Feed');

class FeedCollection {
  constructor(opts) {
    this.opts = opts || {};

    let defaultFeedOptions = {
      maxItemHistory: 50,
      onNewItem: this.handleNewItem
    };

    this.feeds = [];
    this.interval = null;
    this.isDBReady = false;
    this.rules = {};
    this.db = this.loadDatabase();

    this.init();
  }

  addFeed(feed, callback) {
    this.addItem('feed', feed, (newFeed) => {
      this.startNewFeed(newFeed);
      callback(newFeed);
    });
  }

  addItem(type, item, callback) {
    if (!this.isDBReady) {
      return;
    }

    this.db.insert(Object.assign(item, {type}), (err, newDoc) => {
      if (err) {
        callback(null, err);
        return;
      }

      callback(newDoc);
    });
  }

  addRule(rule, callback) {
    this.addItem('rule', rule, callback);
  }

  downloadTorrent(matchedTorrent, downloadRule) {
    this.db.find({type: 'matchedTorrents'}, (err, previouslyMatchedTorrents) => {
      if (err) {
        return;
      }

      let shouldDownload = !this.isTorrentURLAlreadyDownloaded(
        matchedTorrent.torrent.link, previouslyMatchedTorrents[0] || {});

      if (shouldDownload) {
        client.addUrls({
          urls: matchedTorrent.torrent.link,
          destination: downloadRule.destination,
          start: downloadRule.startOnLoad,
          tags: downloadRule.tags
        }, () => {
          this.db.update({type: 'matchedTorrents'},
            {$push: {urls: matchedTorrent.torrent.link}}, {upsert: true});

          this.db.update({_id: downloadRule._id}, {$inc: {count: 1}},
            {upsert: true});

          this.db.update({_id: matchedTorrent.feed._id}, {$inc: {count: 1}},
            {upsert: true});
        });
      }
    });
  }

  getAll(query, callback) {
    query = query || {};

    this.db.find({}, (err, docs) => {
      if (err) {
        callback(null, err);
        return;
      }

      callback(docs.reduce((memo, item) => {
        let type = `${item.type}s`;

        if (memo[type] == null) {
          memo[type] = [];
        }

        memo[type].push(item);

        return memo;
      }, {}));
    });
  }

  getFeeds(query, callback) {
    this.getItem('feed', query, callback);
  }

  getItem(type, query, callback) {
    query = query || {};

    this.db.find(Object.assign(query, {type}), (err, docs) => {
      if (err) {
        callback(null, err);
        return;
      }

      callback(docs);
    });
  }

  getRules(query, callback) {
    this.getItem('rule', query, callback);
  }

  handleNewItem(feedItem) {
    let downloadRules = this.rules[feedItem.feed._id];

    if (downloadRules) {
      downloadRules.forEach((downloadRule) => {
        if (!downloadRule.field || !downloadRule.match) {
          return;
        }

        let isFeedMatched = feedItem.torrent[downloadRule.field]
          .match(new RegExp(downloadRule.match, 'gi'));

        if (!isFeedMatched) {
          return;
        }

        let isFeedExcluded = downloadRule.exclude
          && feedItem.torrent[downloadRule.field]
            .match(new RegExp(downloadRule.exclude, 'gi'));

        if (!isFeedExcluded) {
          this.downloadTorrent(feedItem, downloadRule);
        }
      });
    }
  }

  init() {
    this.db.find({}, (err, docs) => {
      if (err) {
        return;
      }

      let newItemHandler = this.handleNewItem.bind(this);

      docs.forEach((doc) => {
        if (doc.type === 'feed') {
          this.startNewFeed(doc);
        } else if (doc.type === 'rule') {
          if (this.rules[doc.feedID] == null) {
            this.rules[doc.feedID] = [];
          }

          this.rules[doc.feedID].push(doc);
        }
      });
    });
  }

  loadDatabase() {
    let db = new Datastore({
      autoload: true,
      filename: `${config.dbPath}settings/feeds.db`
    });

    this.isDBReady = true;
    return db;
  }

  removeItem(id, callback) {
    let indexToRemove = -1;
    let itemToRemove = this.feeds.find((feed, index) => {
      indexToRemove = index;
      return feed.options._id === id;
    });

    if (itemToRemove != null) {
      itemToRemove.stop();
      this.feeds.splice(indexToRemove, 1);
    }

    this.db.remove({_id: id}, {}, (err, docs) => {
      if (err) {
        callback(null, err);
        return;
      }

      callback(docs);
    });
  }

  isTorrentURLAlreadyDownloaded(torrentURL, downloadedTorrents) {
    let isAlreadyDownloaded = false;

    if (!!downloadedTorrents.urls && downloadedTorrents.urls.length > 0) {
      downloadedTorrents.urls.some(url => {
        if (torrentURL === url) {
          isAlreadyDownloaded = true;
        }

        return isAlreadyDownloaded;
      });
    }

    return isAlreadyDownloaded;
  }

  startNewFeed(feedConfig) {
    feedConfig.onNewItem = this.handleNewItem.bind(this);
    this.feeds.push(new Feed(feedConfig));
  }
}

module.exports = new FeedCollection();
