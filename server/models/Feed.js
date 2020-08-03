const FeedSub = require('feedsub');

class Feed {
  constructor(options) {
    this.options = options || {};
    this.options.maxItemHistory = options.maxItemHistory || 100;
    this.items = [];

    if (!options.url) {
      console.error('Feed URL must be defined.');
      return null;
    }

    this.reader = new FeedSub(options.url, {
      autoStart: true,
      emitOnStart: true,
      maxHistory: this.options.maxItemHistory,
      interval: options.interval ? Number(options.interval) : 15,
      forceInterval: true,
      readEveryItem: true,
    });

    this.initReader();
  }

  modify(options) {
    Object.assign(this.options, options);
    this.items = [];

    this.reader = new FeedSub(options.url, {
      autoStart: true,
      emitOnStart: true,
      maxHistory: this.options.maxItemHistory,
      interval: options.interval ? Number(options.interval) : 15,
      forceInterval: true,
      readEveryItem: true,
    });

    this.initReader();
  }

  getItems() {
    return this.items;
  }

  handleFeedItems(items) {
    const nextLength = this.items.length + items.length;
    if (nextLength >= this.options.maxItemHistory) {
      const diff = nextLength - this.options.maxHistory;
      this.items = this.items.splice(0, diff);
    }

    this.items = this.items.concat(items);

    this.options.onNewItems({
      feed: this.options,
      items,
    });
  }

  initReader() {
    this.reader.on('items', this.handleFeedItems.bind(this));
    this.reader.on('error', (error) => {
      console.log('Feed reader error:', error);
    });
    this.reader.start();
  }

  stopReader() {
    this.reader.stop();
  }
}

module.exports = Feed;
