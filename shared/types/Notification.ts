import type {NotificationSchema, NotificationStateSchema} from '../schema/Notification';

export type Notification = NotificationSchema;
export type NotificationState = NotificationStateSchema;
export type NotificationCount = NotificationStateSchema['count'];

export interface NotificationFetchOptions {
  id?: string;
  limit: number;
  start: number;
  allNotifications?: boolean;
}
