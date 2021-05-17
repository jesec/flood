import Datastore from 'nedb-promises';
import path from 'path';

import type {
  Notification,
  NotificationCount,
  NotificationFetchOptions,
  NotificationState,
} from '@shared/types/Notification';

import BaseService from './BaseService';
import config from '../../config';

interface NotificationServiceEvents {
  NOTIFICATION_COUNT_CHANGE: (payload: {id: number; data: NotificationCount}) => void;
}

const DEFAULT_QUERY_LIMIT = 20;

class NotificationService extends BaseService<NotificationServiceEvents> {
  count: NotificationCount = {read: 0, total: 0, unread: 0};
  db = Datastore.create({
    autoload: true,
    filename: path.join(config.dbPath, this.user._id, 'notifications.db'),
  });

  constructor(...args: ConstructorParameters<typeof BaseService>) {
    super(...args);

    (async () => {
      const notifications = await this.db.find<Notification>({}).catch(() => undefined);

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
      .insert(
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
    await this.db.remove({}, {multi: true});

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
    const sortedNotifications = this.db.find<Notification>({}).sort({ts: -1});

    if (allNotifications) {
      return {
        notifications: await sortedNotifications.exec(),
        count: this.count,
      };
    } else if (start != null) {
      return {
        notifications: await sortedNotifications
          .skip(Number(start))
          .limit(Number(limit) || DEFAULT_QUERY_LIMIT)
          .exec(),
        count: this.count,
      };
    } else {
      return {
        notifications: await sortedNotifications.limit(Number(limit) || DEFAULT_QUERY_LIMIT).exec(),
        count: this.count,
      };
    }
  }
}

export default NotificationService;
