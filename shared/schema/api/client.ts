import type {infer as zodInfer} from 'zod';

import {clientSettingsSchema} from '../ClientSettings';

// PATCH /api/client/settings
export const setClientSettingsSchema = clientSettingsSchema.partial();

export type SetClientSettingsSchema = zodInfer<typeof setClientSettingsSchema>;
