import {floodSettingKeySchema, floodSettingsSchema} from '@shared/schema/FloodSettings';
import {z} from 'zod';

export const directoryListQuerySchema = z
  .object({
    path: z.string().min(1),
  })
  .strip();

export const notificationFetchQuerySchema = z
  .object({
    id: z.string().optional(),
    limit: z.coerce.number().int().nonnegative().default(0),
    start: z.coerce.number().int().nonnegative().default(0),
    allNotifications: z.coerce.boolean().optional(),
  })
  .strip();

export const settingPropertyParamSchema = z
  .object({
    property: floodSettingKeySchema,
  })
  .strip();

// Allow clients to send extra keys and normalize null -> undefined for legacy callers.
export const setFloodSettingsSchema = z.preprocess((raw) => {
  if (raw == null || typeof raw !== 'object') return raw;

  const entries = Object.entries(raw as Record<string, unknown>).map(([key, value]) => [
    key,
    value === null ? undefined : value,
  ]);

  return Object.fromEntries(entries);
}, floodSettingsSchema.partial().strip());
