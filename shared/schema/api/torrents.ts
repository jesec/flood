import type {infer as zodInfer} from 'zod';
import {array, boolean, number, record, strictObject, string} from 'zod';

import {tagSchema, tagsSchema} from './tags';

// POST /api/torrents/add-urls
export const addTorrentByURLSchema = strictObject({
  // URLs to download torrents from
  urls: array(string()).nonempty(),
  // Cookies to attach to requests, arrays of strings in the format "name=value" with domain as key
  cookies: record(array(string())).optional(),
  // Path of destination
  destination: string().optional(),
  // Tags
  tags: tagsSchema.optional(),
  // Whether destination is the base path [default: false]
  isBasePath: boolean().optional(),
  // Whether destination contains completed contents [default: false]
  isCompleted: boolean().optional(),
  // Whether contents of a torrent should be downloaded sequentially [default: false]
  isSequential: boolean().optional(),
  // Whether to use initial seeding mode [default: false]
  isInitialSeeding: boolean().optional(),
  // Whether to start torrent [default: false]
  start: boolean().optional(),
});

export type AddTorrentByURLOptions = zodInfer<typeof addTorrentByURLSchema>;

// POST /api/torrents/add-files
export const addTorrentByFileSchema = strictObject({
  // Torrent files in base64
  files: array(string()).nonempty(),
  // Path of destination
  destination: string().optional(),
  // Tags
  tags: tagsSchema.optional(),
  // Whether destination is the base path [default: false]
  isBasePath: boolean().optional(),
  // Whether destination contains completed contents [default: false]
  isCompleted: boolean().optional(),
  // Whether contents of a torrent should be downloaded sequentially [default: false]
  isSequential: boolean().optional(),
  // Whether to use initial seeding mode [default: false]
  isInitialSeeding: boolean().optional(),
  // Whether to start torrent [default: false]
  start: boolean().optional(),
});

export type AddTorrentByFileOptions = zodInfer<typeof addTorrentByFileSchema>;

// PATCH /api/torrents/tags
export const setTorrentsTagsSchema = strictObject({
  // An array of string representing hashes of torrents to operate on
  hashes: array(string()).nonempty(),
  // An array of string representing tags
  tags: array(tagSchema),
});

export type SetTorrentsTagsOptions = zodInfer<typeof setTorrentsTagsSchema>;

// POST /api/torrents/reannounce
export const reannounceTorrentsSchema = strictObject({
  // An array of string representing hashes of torrents to be reannounced
  hashes: array(string()).nonempty(),
});

export type ReannounceTorrentsOptions = zodInfer<typeof reannounceTorrentsSchema>;

// POST /api/torrents/move
export const moveTorrentsSchema = strictObject({
  // Hashes of torrents to be moved
  hashes: array(string()).nonempty(),
  // Path of destination
  destination: string(),
  // Whether to move data of torrents
  moveFiles: boolean(),
  // Whether destination is the base path
  isBasePath: boolean(),
  // Whether to check hash after completion
  isCheckHash: boolean(),
});

export type MoveTorrentsOptions = zodInfer<typeof moveTorrentsSchema>;

const torrentHashesSchema = array(string()).nonempty();

// POST /api/torrents/start
export const startTorrentsSchema = strictObject({
  hashes: torrentHashesSchema,
});

// POST /api/torrents/stop
export const stopTorrentsSchema = strictObject({
  hashes: torrentHashesSchema,
});

// POST /api/torrents/check-hash
export const checkTorrentsSchema = strictObject({
  hashes: torrentHashesSchema,
});

// POST /api/torrents/delete
export const deleteTorrentsSchema = strictObject({
  hashes: torrentHashesSchema,
  deleteData: boolean().optional(),
});

// PATCH /api/torrents/initial-seeding
export const setTorrentsInitialSeedingSchema = strictObject({
  hashes: torrentHashesSchema,
  isInitialSeeding: boolean(),
});

// PATCH /api/torrents/priority
export const setTorrentsPrioritySchema = strictObject({
  hashes: torrentHashesSchema,
  priority: number().int().min(0).max(3),
});

// PATCH /api/torrents/sequential
export const setTorrentsSequentialSchema = strictObject({
  hashes: torrentHashesSchema,
  isSequential: boolean(),
});

// PATCH /api/torrents/trackers
export const setTorrentsTrackersSchema = strictObject({
  hashes: torrentHashesSchema,
  trackers: array(string()),
});

// PATCH /api/torrents/{hash}/contents
export const setTorrentContentsPropertiesSchema = strictObject({
  indices: array(number().int().nonnegative()).nonempty(),
  priority: number().int().min(0).max(2),
});

// GET /api/torrents/{hash}/contents/{indices}/data
export const contentTokenSchema = strictObject({
  username: string(),
  hash: string(),
  indices: string(),
  // issued at
  iat: number(),
  // expiration
  exp: number(),
});

export type ContentToken = zodInfer<typeof contentTokenSchema>;
