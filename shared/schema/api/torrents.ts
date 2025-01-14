import type {infer as zodInfer} from 'zod';
import {array, boolean, number, record, strictObject, string} from 'zod';

import {noComma} from '../../util/regEx';

const TAG_NO_COMMA_MESSAGE = {
  message: 'Tag must not contain comma',
};

// POST /api/torrents/add-urls
export const addTorrentByURLSchema = strictObject({
  // URLs to download torrents from
  urls: array(string()).nonempty(),
  // Cookies to attach to requests, arrays of strings in the format "name=value" with domain as key
  cookies: record(array(string())).optional(),
  // Path of destination
  destination: string().optional(),
  // Tags
  tags: array(string().regex(noComma, TAG_NO_COMMA_MESSAGE)).optional(),
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
  tags: array(string().regex(noComma, TAG_NO_COMMA_MESSAGE)).optional(),
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
  tags: array(string().regex(noComma, TAG_NO_COMMA_MESSAGE)),
});

export type SetTorrentsTagsOptions = zodInfer<typeof setTorrentsTagsSchema>;

// POST /api/torrents/reannounce
export const reannounceTorrentsSchema = strictObject({
  // An array of string representing hashes of torrents to be reannounced
  hashes: array(string()).nonempty(),
});

export type ReannounceTorrentsOptions = zodInfer<typeof reannounceTorrentsSchema>;

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
