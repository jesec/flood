import {floodSettingKeySchema, floodSettingsSchema} from '@shared/schema/FloodSettings';
import {z} from 'zod';

export const directoryListQuerySchema = z
  .object({
    path: z.string().min(1),
  })
  .strict();

export const notificationFetchQuerySchema = z
  .object({
    id: z.string().optional(),
    limit: z.coerce.number().int().nonnegative().default(0),
    start: z.coerce.number().int().nonnegative().default(0),
    allNotifications: z.coerce.boolean().optional(),
  })
  .strict();

export const settingPropertyParamSchema = z
  .object({
    property: floodSettingKeySchema,
  })
  .strict();

export const setFloodSettingsSchema = floodSettingsSchema.partial().strict();
