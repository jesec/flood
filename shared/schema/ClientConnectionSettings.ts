import * as z from 'zod';

const delugeConnectionSettingsSchema = z.object({
  client: z.literal('Deluge'),
  type: z.literal('web'),
  version: z.literal(1),
  url: z.string().url(),
  password: z.string(),
});

export type DelugeConnectionSettings = z.infer<typeof delugeConnectionSettingsSchema>;

const qBittorrentConnectionSettingsSchema = z.object({
  client: z.literal('qBittorrent'),
  type: z.literal('web'),
  version: z.literal(1),
  url: z.string().url(),
  username: z.string(),
  password: z.string(),
});

export type QBittorrentConnectionSettings = z.infer<typeof qBittorrentConnectionSettingsSchema>;

const rTorrentTCPConnectionSettingsSchema = z.object({
  client: z.literal('rTorrent'),
  type: z.literal('tcp'),
  version: z.literal(1),
  host: z.string(),
  port: z.number(),
});

export type RTorrentTCPConnectionSettings = z.infer<typeof rTorrentTCPConnectionSettingsSchema>;

const rTorrentSocketConnectionSettingsSchema = z.object({
  client: z.literal('rTorrent'),
  type: z.literal('socket'),
  version: z.literal(1),
  socket: z.string(),
});

export type RTorrentSocketConnectionSettings = z.infer<typeof rTorrentSocketConnectionSettingsSchema>;

const rTorrentConnectionSettingsSchema = z.union([
  rTorrentTCPConnectionSettingsSchema,
  rTorrentSocketConnectionSettingsSchema,
]);

export type RTorrentConnectionSettings = z.infer<typeof rTorrentConnectionSettingsSchema>;

const transmissionConnectionSettingsSchema = z.object({
  client: z.literal('Transmission'),
  type: z.literal('web'),
  version: z.literal(1),
  url: z.string().url(),
  username: z.string(),
  password: z.string(),
});

export type TransmissionConnectionSettings = z.infer<typeof transmissionConnectionSettingsSchema>;

export const clientConnectionSettingsSchema = z.union([
  qBittorrentConnectionSettingsSchema,
  rTorrentConnectionSettingsSchema,
]);

export type ClientConnectionSettings = z.infer<typeof clientConnectionSettingsSchema>;

export const SUPPORTED_CLIENTS: Array<ClientConnectionSettings['client']> = ['qBittorrent', 'rTorrent'];
