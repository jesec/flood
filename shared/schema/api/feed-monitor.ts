import {z} from 'zod';

export const feedIdParamSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export const feedIdOptionalParamSchema = z
  .object({
    id: z.string().min(1).optional(),
  })
  .strict();

export const feedItemsQuerySchema = z
  .object({
    search: z.string().optional(),
  })
  .strict();

export const addFeedSchema = z
  .object({
    label: z.string().min(1),
    url: z.string().min(1),
    interval: z.number().int().positive(),
  })
  .strict();

export const modifyFeedSchema = addFeedSchema.partial().strict();

export const addRuleSchema = z
  .object({
    label: z.string().min(1),
    feedIDs: z.array(z.string().min(1)).nonempty(),
    field: z.string().optional(),
    match: z.string(),
    exclude: z.string(),
    destination: z.string().min(1),
    tags: z.array(z.string()),
    startOnLoad: z.boolean(),
    isBasePath: z.boolean().optional(),
  })
  .strict();
