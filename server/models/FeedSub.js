'use strict';

const FeedParser = require("feedparser"),
request = require("request"),
EventEmitter = require("events").EventEmitter,
util = require("util");

function FeedSub(url, interval) {

  // Get EventEmitter props
  EventEmitter.call(this);

  // Function to parse and get items from feed
  var readFeed = () => {

    // Download the feed
    var req = request(url),
    feedparser = new FeedParser({feedurl: url});

    // Listen for errors
    req.on('error', error => {
      this.emit("error", new Error(`Error downloading feed from '${url}': ${error}.`));
    });

    // Listen for successful connection
    req.on('response', res => {

      // If status code is not 200 OKAY
      if(res.statusCode !== 200) {
        this.emit("error", new Error(`Error downloading feed from '${url}': Status code: ${res.statusCode}.`));
      } else {
        res.pipe(feedparser);
      }

      // Handle parsing errors
      feedparser.on("error", error => {
        this.emit("error", new Error(`Error parsing feed from '${url}': ${error}.`));
      });

      // Return items from feed
      feedparser.on('readable', () => {

        var item;
        while(item = feedparser.read()) {
          if(!!item) {
            if(!!item.link) this.emit('item', item);
            if(!!item.enclosures) {item.enclosures.forEach(enclosure => {
              item.link = enclosure.url;
              this.emit('item', item);
            });
          }
        }
      }

    });

  });

};

// Fetch the feed at the specified interval (minutes)
setInterval(readFeed, interval * 60 * 1000);

// Fetch the feed once on initialization
readFeed();

};

// Extend EventEmitter
util.inherits(FeedSub, EventEmitter);

module.exports = FeedSub;
