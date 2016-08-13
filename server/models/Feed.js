'use strict';

let FeedSub = require('feedsub');

class Feed {
  constructor(options) {
    this.options = options || {};

    if (!options.url) {
      console.error('Feed URL must be defined.');
      return null;
    }

    this.items = [];
    this.maxItemHistory = options.maxItemHistory || 10;
    this.reader = new FeedSub(options.url, {
      autoStart: true,
      emitOnStart: true,
      interval: options.interval || 15
    });

    this.initReader();
  }

  getRecentItems() {
    return this.items;
  }

  handleFeedItem(item) {
    let arrayAction = 'push';

    if (this.items.length >= this.maxItemHistory) {
      arrayAction = 'shift';
    }

    this.items[arrayAction](item);

    this.options.onNewItem({feed: this.options, torrent: item});
  }

  initReader() {
    this.reader.on('item', this.handleFeedItem.bind(this));
    this.reader.on('error', error => {
      console.log('Feed reader error:', error);
    });
    this.reader.start();
  }

  stop() {
    this.reader.stop();
  }
}

module.exports = Feed;
