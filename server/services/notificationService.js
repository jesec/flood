const _ = require('lodash');
const Datastore = require('nedb');
const EventEmitter = require('events');
const path = require('path');

const BaseService = require('./BaseService');
const config = require('../../config');
const notificationServiceEvents = require('../constants/notificationServiceEvents');

const DEFAULT_QUERY_LIMIT = 20;
const INITIAL_COUNT_VALUE = {read: 0, total: 0, unread: 0};

class NotificationService extends BaseService {
  constructor() {
    super(...arguments);

    this.count = Object.assign({}, INITIAL_COUNT_VALUE);
    this.ready = false;

    this.db = this.loadDatabase();

    this.emitUpdate = _.debounce(this.emitUpdate.bind(this), 100);
    this.countNotifications();
  }

  addNotification(notifications) {
    notifications = _.castArray(notifications);

    this.count.total = this.count.total + notifications.length;
    this.count.unread = this.count.unread + notifications.length;

    const timestamp = Date.now();
    const notificationsToInsert = notifications.map(notification => {
      return {
        ts: timestamp,
        data: notification.data,
        id: notification.id,
        read: false
      };
    });

    this.db.insert(notificationsToInsert, () => this.emitUpdate());
  }

  clearNotifications(options, callback) {
    this.db.remove({}, {multi: true}, (err) => {
      if (err) {
        callback(null, err);
        return;
      }

      this.count = Object.assign({}, INITIAL_COUNT_VALUE);

      callback();
    });

    this.emitUpdate();
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

      this.emitUpdate();
    });
  }

  emitUpdate() {
    this.emit(
      notificationServiceEvents.NOTIFICATION_COUNT_CHANGE,
      {
        id: Date.now(),
        data: this.count
      }
    );
  }

  getNotificationCount() {
    return this.count;
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
    if (this.ready) return;

    const db = new Datastore({
      autoload: true,
      filename: path.join(config.dbPath, this.user._id, 'notifications.db')
    });

    this.ready = true;

    return db;
  }
}

module.exports = NotificationService;
