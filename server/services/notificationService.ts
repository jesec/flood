import Datastore from 'nedb';
import path from 'path';

import type {Notification, NotificationCount, NotificationFetchOptions} from '@shared/types/Notification';

import BaseService from './BaseService';
import config from '../../config';

interface NotificationServiceEvents {
  NOTIFICATION_COUNT_CHANGE: (payload: {id: number; data: NotificationCount}) => void;
}

const DEFAULT_QUERY_LIMIT = 20;

class NotificationService extends BaseService<NotificationServiceEvents> {
  count: NotificationCount = {read: 0, total: 0, unread: 0};
  db = this.loadDatabase();

  constructor(...args: ConstructorParameters<typeof BaseService>) {
    super(...args);

    this.onServicesUpdated = () => {
      this.countNotifications();
    };
  }

  addNotification(notifications: Array<Pick<Notification, 'id' | 'data'>>) {
    this.count.total += notifications.length;
    this.count.unread += notifications.length;

    const timestamp = Date.now();
    const notificationsToInsert = notifications.map((notification) => ({
      ts: timestamp,
      data: notification.data,
      id: notification.id,
      read: false,
    })) as Notification[];

    this.db.insert(notificationsToInsert, () => this.emitUpdate());
  }

  clearNotifications(callback: (data?: null, err?: Error) => void) {
    this.db.remove({}, {multi: true}, (err) => {
      if (err) {
        callback(null, err);
        return;
      }

      this.count = {read: 0, total: 0, unread: 0};

      callback();
    });

    this.emitUpdate();
  }

  countNotifications() {
    this.db.find({}, (err: Error, notifications: Array<Notification>) => {
      if (err) {
        this.count = {read: 0, total: 0, unread: 0};
      } else {
        notifications.forEach((notification) => {
          if (notification.read) {
            this.count.read += 1;
          } else {
            this.count.unread += 1;
          }

          this.count.total += 1;
        });
      }

      this.emitUpdate();
    });
  }

  emitUpdate = () => {
    this.emit('NOTIFICATION_COUNT_CHANGE', {
      id: Date.now(),
      data: this.count,
    });
  };

  getNotificationCount() {
    return this.count;
  }

  getNotifications(
    query: NotificationFetchOptions,
    callback: (data: {notifications: Notification[][]; count: NotificationCount} | null, err?: Error) => void,
  ) {
    const sortedNotifications = this.db.find({}).sort({ts: -1});
    const queryCallback = (err: Error | null, notifications: Notification[][]) => {
      if (err) {
        callback(null, err);
        return;
      }

      callback({notifications, count: this.count});
    };

    if (query.allNotifications) {
      sortedNotifications.exec(queryCallback);
    } else if (query.start != null) {
      sortedNotifications
        .skip(Number(query.start))
        .limit(Number(query.limit) || DEFAULT_QUERY_LIMIT)
        .exec(queryCallback);
    } else {
      sortedNotifications.limit(Number(query.limit) || DEFAULT_QUERY_LIMIT).exec(queryCallback);
    }
  }

  loadDatabase(): Datastore<Array<Notification>> {
    if (this.db != null) {
      return this.db;
    }

    const db = new Datastore({
      autoload: true,
      filename: path.join(config.dbPath, this.user._id, 'notifications.db'),
    });

    return db;
  }
}

export default NotificationService;
