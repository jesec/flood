import type {infer as zodInfer} from 'zod';
import {array, number, strictObject} from 'zod';

export const transferHistorySchema = strictObject({
  download: array(number()),
  upload: array(number()),
  timestamps: array(number()),
});

export type TransferHistorySchema = zodInfer<typeof transferHistorySchema>;
