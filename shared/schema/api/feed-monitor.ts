import {z} from 'zod';

import {tagsSchema} from './tags';

export const feedIdParamSchema = z
  .object({
    id: z.string().min(1),
  })
  .strip();

export const feedIdOptionalParamSchema = z
  .object({
    id: z.string().min(1).optional(),
  })
  .strip();

export const feedItemsQuerySchema = z
  .object({
    search: z.string().optional(),
  })
  .strip();

export const addFeedSchema = z
  .object({
    label: z.string().min(1),
    url: z.string().min(1),
    interval: z.number().int().positive(),
  })
  .strip();

export const modifyFeedSchema = addFeedSchema.partial().strip();

export const addRuleSchema = z
  .object({
    label: z.string().min(1),
    feedIDs: z.array(z.string().min(1)).nonempty(),
    field: z.string().optional(),
    match: z.string(),
    exclude: z.string(),
    destination: z.string().min(1),
    tags: tagsSchema,
    startOnLoad: z.boolean(),
    isBasePath: z.boolean().optional(),
  })
  .strip();
