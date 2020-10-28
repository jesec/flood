import {literal, number, object, string, union} from 'zod';
import type {infer as zodInfer} from 'zod';

const delugeConnectionSettingsSchema = object({
  client: literal('Deluge'),
  type: literal('web'),
  version: literal(1),
  url: string().url(),
  password: string(),
});

export type DelugeConnectionSettings = zodInfer<typeof delugeConnectionSettingsSchema>;

const qBittorrentConnectionSettingsSchema = object({
  client: literal('qBittorrent'),
  type: literal('web'),
  version: literal(1),
  url: string().url(),
  username: string(),
  password: string(),
});

export type QBittorrentConnectionSettings = zodInfer<typeof qBittorrentConnectionSettingsSchema>;

const rTorrentTCPConnectionSettingsSchema = object({
  client: literal('rTorrent'),
  type: literal('tcp'),
  version: literal(1),
  host: string(),
  port: number(),
});

export type RTorrentTCPConnectionSettings = zodInfer<typeof rTorrentTCPConnectionSettingsSchema>;

const rTorrentSocketConnectionSettingsSchema = object({
  client: literal('rTorrent'),
  type: literal('socket'),
  version: literal(1),
  socket: string(),
});

export type RTorrentSocketConnectionSettings = zodInfer<typeof rTorrentSocketConnectionSettingsSchema>;

const rTorrentConnectionSettingsSchema = union([
  rTorrentTCPConnectionSettingsSchema,
  rTorrentSocketConnectionSettingsSchema,
]);

export type RTorrentConnectionSettings = zodInfer<typeof rTorrentConnectionSettingsSchema>;

const transmissionConnectionSettingsSchema = object({
  client: literal('Transmission'),
  type: literal('rpc'),
  version: literal(1),
  url: string().url(),
  username: string(),
  password: string(),
});

export type TransmissionConnectionSettings = zodInfer<typeof transmissionConnectionSettingsSchema>;

export const clientConnectionSettingsSchema = union([
  qBittorrentConnectionSettingsSchema,
  rTorrentConnectionSettingsSchema,
  transmissionConnectionSettingsSchema,
]);

export type ClientConnectionSettings = zodInfer<typeof clientConnectionSettingsSchema>;
