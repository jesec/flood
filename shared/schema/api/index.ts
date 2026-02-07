import {z} from 'zod';

export const directoryListQuerySchema = z
  .object({
    path: z.string().min(1),
  })
  .strict();

export const notificationFetchQuerySchema = z
  .object({
    id: z.string().optional(),
    limit: z.coerce.number().int().nonnegative().optional(),
    start: z.coerce.number().int().nonnegative().optional(),
    allNotifications: z.coerce.boolean().optional(),
  })
  .strict();

export const settingPropertyParamSchema = z
  .object({
    property: z.string().min(1),
  })
  .strict();

export const setFloodSettingsSchema = z.record(z.string(), z.unknown());
