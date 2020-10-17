import path from 'path';
import Datastore from 'nedb';

import BaseService from './BaseService';
import config from '../../config';
import Feed from '../models/Feed';
import regEx from '../../shared/util/regEx';

// TODO: Allow users to specify which key contains the URLs.
const getTorrentUrlsFromItem = (feedItem) => {
  // If we've got an Array of enclosures, we'll iterate over the values and
  // look for the url key.
  if (feedItem.enclosures && Array.isArray(feedItem.enclosures)) {
    return feedItem.enclosures.reduce((urls, enclosure) => {
      if (enclosure.url) {
        urls.push(enclosure.url);
      }

      return urls;
    }, []);
  }

  // If we've got a Object of enclosures, use url key
  if (feedItem.enclosure && feedItem.enclosure.url) {
    return [feedItem.enclosure.url];
  }

  // If there are no enclosures, then use the link tag instead
  if (feedItem.link) {
    // remove CDATA tags around links
    const cdata = regEx.cdata.exec(feedItem.link);

    if (cdata && cdata[1]) {
      return [cdata[1]];
    }

    return [feedItem.link];
  }

  return [];
};

const getItemsMatchingRules = (feedItems, rules, feed) => {
  return feedItems.reduce((matchedItems, feedItem) => {
    rules.forEach((rule) => {
      const isMatched = new RegExp(rule.match, 'gi').test(feedItem[rule.field]);
      const isExcluded = rule.exclude !== '' && new RegExp(rule.exclude, 'gi').test(feedItem[rule.field]);

      if (isMatched && !isExcluded) {
        const torrentUrls = getTorrentUrlsFromItem(feedItem);
        const isAlreadyDownloaded = matchedItems.some((matchedItem) =>
          torrentUrls.every((url) => matchedItem.urls.includes(url)),
        );

        if (!isAlreadyDownloaded) {
          matchedItems.push({
            urls: torrentUrls,
            tags: rule.tags,
            feedID: rule.feedID,
            feedLabel: feed.label,
            matchTitle: feedItem.title,
            ruleID: rule._id,
            ruleLabel: rule.label,
            destination: rule.destination,
            startOnLoad: rule.startOnLoad,
          });
        }
      }
    });

    return matchedItems;
  }, []);
};

const getUrlsFromItems = (feedItems) => {
  return feedItems.reduce((urls, feedItem) => urls.concat(feedItem.urls), []);
};

class FeedService extends BaseService {
  constructor(...args) {
    super(...args);

    this.db = this.loadDatabase();
    this.onServicesUpdated = () => {
      this.init();
    };
  }

  addFeed(feed, callback) {
    this.addItem('feed', feed, (newFeed) => {
      this.startNewFeed(newFeed);
      callback(newFeed);
    });
  }

  modifyFeed(id, feedToModify, callback) {
    const modifiedFeed = this.feeds.find((feed) => feed.options._id === id);
    modifiedFeed.stopReader();
    modifiedFeed.modify(feedToModify);
    this.modifyItem(id, feedToModify, (err) => {
      callback(err);
    });
  }

  addItem(type, item, callback) {
    if (this.db == null) {
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

  modifyItem(id, newItem, callback) {
    if (this.db == null) {
      return;
    }

    this.db.update({_id: id}, {$set: newItem}, {}, (err) => {
      if (err) {
        callback(null, err);
        return;
      }

      callback(null);
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

      const associatedFeed = this.feeds.find((feed) => feed.options._id === newRule.feedID);

      if (associatedFeed) {
        this.handleNewItems({
          feed: associatedFeed.options,
          items: associatedFeed.getItems(),
        });
      }
    });
  }

  getAll(callback) {
    this.db.find({}, (err, docs) => {
      if (err) {
        callback(null, err);
        return;
      }

      callback(
        docs.reduce((memo, item) => {
          const type = `${item.type}s`;

          if (memo[type] == null) {
            memo[type] = [];
          }

          memo[type].push(item);

          return memo;
        }, {}),
      );
    });
  }

  getFeeds(query, callback) {
    this.queryItem('feed', query, callback);
  }

  getItems(query, callback) {
    const selectedFeed = this.feeds.find((feed) => feed.options._id === query.id);

    if (selectedFeed) {
      const items = selectedFeed.getItems();

      if (query.search) {
        callback(items.filter((item) => item.title.toLowerCase().indexOf(query.search.toLowerCase()) !== -1));
      } else {
        callback(items);
      }
    } else {
      callback(null);
    }
  }

  getPreviouslyMatchedUrls() {
    return new Promise((resolve, reject) => {
      this.db.find({type: 'matchedTorrents'}, (err, docs) => {
        if (err) {
          reject(err);
        }

        resolve(docs.reduce((matchedUrls, doc) => matchedUrls.concat(doc.urls), []));
      });
    });
  }

  getRules(query, callback) {
    this.queryItem('rule', query, callback);
  }

  handleNewItems({items: feedItems, feed}) {
    this.getPreviouslyMatchedUrls()
      .then((previouslyMatchedUrls) => {
        const applicableRules = this.rules[feed._id];
        if (!applicableRules) return;

        const itemsMatchingRules = getItemsMatchingRules(feedItems, applicableRules, feed);
        const itemsToDownload = itemsMatchingRules.filter((item) =>
          item.urls.some((url) => !previouslyMatchedUrls.includes(url)),
        );

        const lastAddUrlCallback = () => {
          const urlsToAdd = getUrlsFromItems(itemsToDownload);

          this.db.update({type: 'matchedTorrents'}, {$push: {urls: {$each: urlsToAdd}}}, {upsert: true});

          this.services.notificationService.addNotification(
            itemsToDownload.map((item) => ({
              id: 'notification.feed.downloaded.torrent',
              data: {
                feedLabel: item.feedLabel,
                ruleLabel: item.ruleLabel,
                title: item.matchTitle,
              },
            })),
          );
          this.services.torrentService.fetchTorrentList();
        };

        itemsToDownload.forEach((item, index) => {
          this.services.clientGatewayService
            .addTorrentsByURL({
              urls: item.urls,
              destination: item.destination,
              isBasePath: false,
              start: item.startOnLoad,
              tags: item.tags,
            })
            .then(() => {
              if (index === itemsToDownload.length - 1) {
                lastAddUrlCallback();
              }

              this.db.update({_id: item.ruleID}, {$inc: {count: 1}}, {upsert: true});
            })
            .catch(console.error);
        });
      })
      .catch(console.error);
  }

  init() {
    this.feeds = [];
    this.rules = {};
    this.db.find({}, (err, docs) => {
      if (err) {
        return;
      }

      // Create two arrays, one for feeds and one for rules.
      const feedsSummary = docs.reduce(
        (accumulator, doc) => {
          if (doc.type === 'feed' || doc.type === 'rule') {
            accumulator[`${doc.type}s`].push(doc);
          }

          return accumulator;
        },
        {feeds: [], rules: []},
      );

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
    if (this.db != null) {
      return this.db;
    }

    const db = new Datastore({
      autoload: true,
      filename: path.join(config.dbPath, this.user._id, 'settings', 'feeds.db'),
    });

    return db;
  }

  queryItem(type, query, callback) {
    query = query || {};

    this.db.find(Object.assign(query, {type}), (err, docs) => {
      if (err) {
        callback(null, err);
        return;
      }

      callback(docs);
    });
  }

  removeItem(id, callback) {
    let indexToRemove = -1;
    const itemToRemove = this.feeds.find((feed, index) => {
      if (feed.options._id === id) {
        indexToRemove = index;
        return true;
      }

      return false;
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

  startNewFeed(feedConfig) {
    feedConfig.onNewItems = this.handleNewItems.bind(this);
    this.feeds.push(new Feed(feedConfig));
  }
}

export default FeedService;
