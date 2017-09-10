'use strict';

let FeedSub = require('./FeedSub');

class Feed {
  constructor(options) {
    this.options = options || {};

    if (!options.url) {
      console.error('Feed URL must be defined.');
      return null;
    }

    this.items = [];
    this.maxItemHistory = options.maxItemHistory || 100;
    this.reader = new FeedSub(options.url, options.interval || 15);

    this.reader.on('item', this.handleFeedItem.bind(this));
    this.reader.on('error', error => {
      console.log('Feed reader error:', error);
    });
  }

  getItems() {
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

  stopReader() {
    this.reader.stop();
  }
}

module.exports = Feed;
