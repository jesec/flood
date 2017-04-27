'use strict';

let _ = require('lodash');
let Datastore = require('nedb');

let client = require('./client');
let config = require('../../config');
let Feed = require('./Feed');
let NotificationCollection = require('./NotificationCollection');

class FeedCollection {
  constructor() {
    this.feeds = [];
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
    this.addItem('rule', rule, (newRule, error) => {
      if (error) {
        callback(null, error);
        return;
      }

      callback(newRule);

      if (this.rules[newRule.feedID] == null) {
        this.rules[newRule.feedID] = [];
      }

      this.rules[newRule.feedID].push(newRule);

      const associatedFeed = this.feeds.find((feed) => {
        return feed.options._id === newRule.feedID;
      });

      if (associatedFeed) {
        associatedFeed.getItems().forEach((feedItem) => {
          this.checkFeedItemAgainstDownloadRules({
            downloadRules: this.rules[newRule.feedID],
            feedItem: feedItem,
            feed: associatedFeed
          });
        });
      }
    });
  }

  checkFeedItemAgainstDownloadRules(options) {
    const {downloadRules = [], feedItem, feed} = options;

    downloadRules.forEach((downloadRule) => {
      if (!downloadRule.field || !downloadRule.match) {
        return;
      }

      let isFeedMatched = feedItem[downloadRule.field].match(
        new RegExp(downloadRule.match, 'gi')
      );

      if (!isFeedMatched) {
        return;
      }

      let isFeedExcluded = downloadRule.exclude
        && feedItem[downloadRule.field].match(
          new RegExp(downloadRule.exclude, 'gi')
        );

      if (!isFeedExcluded) {
        this.downloadTorrent({
          matchedTorrent: feedItem,
          downloadRule,
          feed
        });
      }
    });
  }

  downloadTorrent(options) {
    const {matchedTorrent, downloadRule, feed} = options;

    this.db.find(
      {type: 'matchedTorrents'},
      (err, previouslyMatchedTorrents) => {
        if (err) {
          return;
        }

        let shouldDownload = !this.isTorrentURLAlreadyDownloaded(
          matchedTorrent.link,
          previouslyMatchedTorrents[0] || {}
        );

        if (shouldDownload) {
          client.addUrls(
            {
              urls: matchedTorrent.link,
              destination: downloadRule.destination,
              start: downloadRule.startOnLoad,
              tags: downloadRule.tags
            },
            () => {
              this.db.update(
                {type: 'matchedTorrents'},
                {$push: {urls: matchedTorrent.link}},
                {upsert: true}
              );

              this.db.update(
                {_id: downloadRule._id},
                {$inc: {count: 1}},
                {upsert: true}
              );

              this.db.update(
                {_id: downloadRule.feedID},
                {$inc: {count: 1}},
                {upsert: true}
              );

              NotificationCollection.addNotification({
                id: 'notification.feed.downloaded.torrent',
                data: {
                  feedLabel: feed.options && feed.options.label,
                  ruleLabel: downloadRule.label,
                  title: matchedTorrent.title
                    || matchedTorrent.name
                    || matchedTorrent.description
                    || 'N/A'
                }
              });
            }
          );
        }
      }
    );
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
    this.checkFeedItemAgainstDownloadRules({
      downloadRules: this.rules[feedItem.feed._id],
      feedItem: feedItem.torrent,
      feed: feedItem.feed
    });
  }

  init() {
    this.db.find({}, (err, docs) => {
      if (err) {
        return;
      }

      // Create two arrays, one for feeds and one for rules.
      const feedsSummary = docs.reduce((accumulator, doc) => {
        if (doc.type === 'feed' || doc.type === 'rule') {
          accumulator[`${doc.type}s`].push(doc);
        }

        return accumulator;
      }, {feeds: [], rules: []});

      // Add all download rules to the local state.
      feedsSummary.rules.forEach((rule) => {
        if (this.rules[rule.feedID] == null) {
          this.rules[rule.feedID] = [];
        }

        this.rules[rule.feedID].push(rule);
      });

      // Initiate all feeds.
      feedsSummary.feeds.forEach((feed) => {
        this.startNewFeed(feed);
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
      itemToRemove.stopReader();
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
