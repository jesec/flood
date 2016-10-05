'use strict';

let Datastore = require('nedb');

let config = require('../../config');

const DEFAULT_QUERY_LIMIT = 20;
const INITIAL_COUNT_VALUE = {read: 0, total: 0, unread: 0};

class NotificationCollection {
  constructor() {
    this.count = Object.assign({}, INITIAL_COUNT_VALUE);
    this.ready = false;

    this.db = this.loadDatabase();

    this.countNotifications();
  }

  addNotification(notification) {
    this.count.total++;
    this.count.unread++;

    this.db.insert({
      ts: Date.now(),
      heading: notification.heading,
      id: notification.id,
      message: notification.message,
      read: false
    });
  }

  clearNotifications(options, callback) {
    this.db.remove({}, {multi: true}, (err, docs) => {
      if (err) {
        callback(null, err);
        return;
      }

      this.count = Object.assign({}, INITIAL_COUNT_VALUE);

      callback();
    });
  }

  countNotifications() {
    this.db.find({}, (err, docs) => {
      if (err) {
        this.count = Object.assign({}, INITIAL_COUNT_VALUE);
      } else {
        docs.forEach((notification) => {
          if (notification.read) {
            this.count.read++;
          } else {
            this.count.unread++;
          }

          this.count.total++;
        });
      }
    });
  }

  getNotifications(query, callback) {
    let sortedNotifications = this.db.find({}).sort({ts: -1});
    let queryCallback = (err, docs) => {
      if (err) {
        callback(null, err);
        return;
      }

      callback({notifications: docs, count: this.count});
    };

    if (query.allNotifications) {
      sortedNotifications.exec(queryCallback);
    } else if (query.start != null) {
      sortedNotifications
        .skip(Number(query.start))
        .limit(Number(query.limit) || DEFAULT_QUERY_LIMIT)
        .exec(queryCallback);
    } else {
      sortedNotifications
        .limit(Number(query.limit) || DEFAULT_QUERY_LIMIT)
        .exec(queryCallback);
    }
  }

  loadDatabase() {
    let db = new Datastore({
      autoload: true,
      filename: `${config.dbPath}notifications.db`
    });

    this.ready = true;
    return db;
  }
}

module.exports = new NotificationCollection();
