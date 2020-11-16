import {array, boolean, object, record, string} from 'zod';

import type {infer as zodInfer} from 'zod';

// POST /api/torrents/add-urls
export const addTorrentByURLSchema = object({
  // URLs to download torrents from
  urls: array(string()).nonempty(),
  // Cookies to attach to requests, arrays of strings in the format "name=value" with domain as key
  cookies: record(array(string())).optional(),
  // Path of destination
  destination: string().optional(),
  // Tags
  tags: array(string()).optional(),
  // Whether destination is the base path [default: false]
  isBasePath: boolean().optional(),
  // Whether destination contains completed contents [default: false]
  isCompleted: boolean().optional(),
  // Whether to start torrent [default: false]
  start: boolean().optional(),
});

export type AddTorrentByURLOptions = zodInfer<typeof addTorrentByURLSchema>;

// POST /api/torrents/add-files
export const addTorrentByFileSchema = object({
  // Torrent files in base64
  files: array(string()).nonempty(),
  // Path of destination
  destination: string().optional(),
  // Tags
  tags: array(string()).optional(),
  // Whether destination is the base path [default: false]
  isBasePath: boolean().optional(),
  // Whether destination contains completed contents [default: false]
  isCompleted: boolean().optional(),
  // Whether to start torrent [default: false]
  start: boolean().optional(),
});

export type AddTorrentByFileOptions = zodInfer<typeof addTorrentByFileSchema>;
