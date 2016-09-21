'use strict';

let Datastore = require('nedb');

let config = require('../../config');

const DEFAULT_AGE_LIMIT = 1000 * 60;

class NotificationCollection {
  constructor() {
    this.count = 0;
    this.ready = false;

    this.db = this.loadDatabase();

    this.countNotifications();
  }

  addNotification(notification) {
    this.count++;

    this.db.insert({
      ts: Date.now(),
      id: notification.id,
      message: notification.message
    });
  }

  countNotifications() {
    this.db.count({}, (err, count) => {
      if (err) {
        this.count = 0;
      } else {
        this.count = count;
      }
    });
  }

  getNotifications(query, callback) {
    let dbQuery = query.allNotifications ? {} :
      {ts: {$gte: Date.now() - (query.ageLimit || DEFAULT_AGE_LIMIT)}};

    // Return the notifications sorted by timestamp.
    this.db.find(dbQuery).sort({ts: 1}).exec((err, docs) => {
      if (err) {
        callback(null, err);
        return;
      }

      callback({notifications: docs, count: this.count});
    });
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
