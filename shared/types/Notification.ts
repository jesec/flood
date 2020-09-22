export interface Notification {
  _id?: string;
  id: 'notification.torrent.finished' | 'notification.torrent.errored' | 'notification.feed.downloaded.torrent';
  read: boolean;
  ts: number; // timestamp
  data: {
    name: string;
    ruleLabel?: string;
    feedLabel?: string;
    title?: string;
  };
}

export interface NotificationCount {
  total: number;
  unread: number;
  read: number;
}

export interface NotificationState {
  id: string;
  count: NotificationCount;
  limit: number;
  start: number;
  notifications: Array<Notification>;
}

export type NotificationFetchOptions = Pick<NotificationState, 'id' | 'limit' | 'start'> & {allNotifications?: boolean};
