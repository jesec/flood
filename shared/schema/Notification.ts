import type {infer as zodInfer} from 'zod';
import {array, boolean, literal, number, strictObject, string, union} from 'zod';

const baseNotificationSchema = strictObject({
  _id: string().optional(),
  read: boolean(),
  ts: number(),
});

const torrentNotificationSchema = baseNotificationSchema.extend({
  id: union([literal('notification.torrent.finished'), literal('notification.torrent.errored')]),
  data: strictObject({
    name: string(),
  }),
});

const feedNotificationSchema = baseNotificationSchema.extend({
  id: literal('notification.feed.torrent.added'),
  data: strictObject({
    title: string(),
    feedLabel: string(),
    ruleLabel: string(),
  }),
});

export const notificationSchema = union([torrentNotificationSchema, feedNotificationSchema]);

export const notificationStateSchema = strictObject({
  count: strictObject({
    total: number(),
    unread: number(),
    read: number(),
  }),
  notifications: array(notificationSchema),
});

export type NotificationSchema = zodInfer<typeof notificationSchema>;
export type NotificationStateSchema = zodInfer<typeof notificationStateSchema>;
