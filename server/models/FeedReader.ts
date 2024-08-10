import FeedSub, {FeedItem} from 'feedsub';

export interface FeedReaderOptions {
  feedID: string;
  feedLabel: string;
  url: string;
  interval: number;
  maxHistory: number;
  onNewItems: (options: FeedReaderOptions, items: Array<FeedItem>) => void;
}

class FeedReader {
  private options: FeedReaderOptions;
  private items: Array<FeedItem> = [];
  private reader: FeedSub | null = null;

  constructor(options: FeedReaderOptions) {
    this.options = options;

    this.initReader();
  }

  modify(options: Partial<FeedReaderOptions>) {
    this.options = {...this.options, ...options};
    this.items = [];

    this.initReader();
  }

  getOptions() {
    return this.options;
  }

  getItems() {
    return this.items;
  }

  handleFeedItems = (items: Array<FeedItem>) => {
    const nextLength = this.items.length + items.length;
    if (nextLength >= this.options.maxHistory) {
      const diff = nextLength - this.options.maxHistory;
      this.items = this.items.splice(0, diff);
    }

    this.items = this.items.concat(items);

    this.options.onNewItems(this.options, items);
  };

  initReader() {
    this.reader = new FeedSub(this.options.url, {
      autoStart: true,
      emitOnStart: true,
      maxHistory: this.options.maxHistory,
      interval: this.options.interval,
      forceInterval: true,
      requestOpts: {
        headers: {
          'User-Agent': 'flood',
        },
      },
    });

    this.reader.on('items', this.handleFeedItems);
    this.reader.on('error', (error) => {
      console.log('Feed reader error:', error);
    });
    this.reader.start();
  }

  stopReader() {
    if (this.reader != null) {
      this.reader.stop();
      this.reader = null;
    }
  }
}

export default FeedReader;
