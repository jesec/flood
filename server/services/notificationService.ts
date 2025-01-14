import path from 'node:path';

import Datastore from '@seald-io/nedb';
import type {
  Notification,
  NotificationCount,
  NotificationFetchOptions,
  NotificationState,
} from '@shared/types/Notification';

import config from '../../config';
import BaseService from './BaseService';

type NotificationServiceEvents = {
  NOTIFICATION_COUNT_CHANGE: (payload: {id: number; data: NotificationCount}) => void;
};

const DEFAULT_QUERY_LIMIT = 20;

class NotificationService extends BaseService<NotificationServiceEvents> {
  count: NotificationCount = {read: 0, total: 0, unread: 0};
  db = new Datastore({
    autoload: true,
    filename: path.join(config.dbPath, this.user._id, 'notifications.db'),
  });

  constructor(...args: ConstructorParameters<typeof BaseService>) {
    super(...args);
    this.db.setAutocompactionInterval(config.dbCleanInterval);

    (async () => {
      const notifications = await this.db.findAsync<Notification>({}).catch(() => undefined);

      if (notifications != null) {
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
    })();
  }

  async destroy(drop: boolean) {
    if (drop) {
      await this.db.dropDatabaseAsync();
    }

    return super.destroy(drop);
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

  /**
   * Adds notifications
   *
   * @param {Array<Notification>} notifications - Notifications to add
   * @return {Promise<void>} - Rejects with error.
   */
  async addNotification(notifications: Array<Pick<Notification, 'id' | 'data'>>, ts = Date.now()): Promise<void> {
    this.count.total += notifications.length;
    this.count.unread += notifications.length;

    await this.db
      .insertAsync(
        notifications.map((notification) => ({
          ts,
          data: notification.data,
          id: notification.id,
          read: false,
        })),
      )
      .catch(() => undefined);

    this.emitUpdate();
  }

  /**
   * Clears notifications
   *
   * @return {Promise<void>} - Rejects with error.
   */
  async clearNotifications(): Promise<void> {
    await this.db.removeAsync({}, {multi: true});

    this.count = {read: 0, total: 0, unread: 0};
    this.emitUpdate();
  }

  /**
   * Gets notifications
   *
   * @param {NotificationFetchOptions} - options - An object of options...
   * @return {NotificationState} - Resolves with notifications and counts or rejects with error.
   */
  async getNotifications({allNotifications, start, limit}: NotificationFetchOptions): Promise<NotificationState> {
    const sortedNotifications = this.db.findAsync<Notification>({}).sort({ts: -1});

    if (allNotifications) {
      return {
        notifications: await sortedNotifications.execAsync(),
        count: this.count,
      };
    } else if (start != null) {
      return {
        notifications: await sortedNotifications
          .skip(Number(start))
          .limit(Number(limit) || DEFAULT_QUERY_LIMIT)
          .execAsync(),
        count: this.count,
      };
    } else {
      return {
        notifications: await sortedNotifications.limit(Number(limit) || DEFAULT_QUERY_LIMIT).execAsync(),
        count: this.count,
      };
    }
  }
}

export default NotificationService;
