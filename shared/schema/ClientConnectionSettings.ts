import type {infer as zodInfer} from 'zod';
import {literal, number, strictObject, string, union, url} from 'zod';

const delugeConnectionSettingsSchema = strictObject({
  client: literal('Deluge'),
  type: literal('rpc'),
  version: literal(1),
  host: string(),
  port: number(),
  username: string(),
  password: string(),
});

export type DelugeConnectionSettings = zodInfer<typeof delugeConnectionSettingsSchema>;

const qBittorrentConnectionSettingsSchema = strictObject({
  client: literal('qBittorrent'),
  type: literal('web'),
  version: literal(1),
  url: url(),
  username: string(),
  password: string(),
});

export type QBittorrentConnectionSettings = zodInfer<typeof qBittorrentConnectionSettingsSchema>;

const rTorrentTCPConnectionSettingsSchema = strictObject({
  client: literal('rTorrent'),
  type: literal('tcp'),
  version: literal(1),
  host: string(),
  port: number(),
});

export type RTorrentTCPConnectionSettings = zodInfer<typeof rTorrentTCPConnectionSettingsSchema>;

const rTorrentSocketConnectionSettingsSchema = strictObject({
  client: literal('rTorrent'),
  type: literal('socket'),
  version: literal(1),
  socket: string(),
});

export type RTorrentSocketConnectionSettings = zodInfer<typeof rTorrentSocketConnectionSettingsSchema>;

// rstorrent (rTorrent in Rust) exposes a native gRPC API (crates/rt-grpc).
// It is a separate connector on purpose: contract, capabilities and transport
// lifecycle differ from the SCGI/XML-RPC rTorrent client.
const rstorrentGRPCTCPConnectionSettingsSchema = strictObject({
  client: literal('rstorrent'),
  type: literal('grpc'),
  version: literal(1),
  host: string(),
  port: number(),
});

export type RstorrentGRPCTCPConnectionSettings = zodInfer<typeof rstorrentGRPCTCPConnectionSettingsSchema>;

const rstorrentGRPCSocketConnectionSettingsSchema = strictObject({
  client: literal('rstorrent'),
  type: literal('grpcSocket'),
  version: literal(1),
  socket: string(),
});

export type RstorrentGRPCSocketConnectionSettings = zodInfer<typeof rstorrentGRPCSocketConnectionSettingsSchema>;

const rTorrentConnectionSettingsSchema = union([
  rTorrentTCPConnectionSettingsSchema,
  rTorrentSocketConnectionSettingsSchema,
]);

export type RTorrentConnectionSettings = zodInfer<typeof rTorrentConnectionSettingsSchema>;

export type RTorrentSCGIConnectionSettings = RTorrentTCPConnectionSettings | RTorrentSocketConnectionSettings;

const rstorrentConnectionSettingsSchema = union([
  rstorrentGRPCTCPConnectionSettingsSchema,
  rstorrentGRPCSocketConnectionSettingsSchema,
]);

export type RstorrentConnectionSettings = zodInfer<typeof rstorrentConnectionSettingsSchema>;

const transmissionConnectionSettingsSchema = strictObject({
  client: literal('Transmission'),
  type: literal('rpc'),
  version: literal(1),
  url: url(),
  username: string(),
  password: string(),
});

export type TransmissionConnectionSettings = zodInfer<typeof transmissionConnectionSettingsSchema>;

const neptuneConnectionSettingsSchema = strictObject({
  client: literal('Neptune'),
  type: literal('rpc'),
  version: literal(1),
  url: url(),
  token: string(),
});

export type NeptuneConnectionSettings = zodInfer<typeof neptuneConnectionSettingsSchema>;

export const clientConnectionSettingsSchema = union([
  delugeConnectionSettingsSchema,
  neptuneConnectionSettingsSchema,
  qBittorrentConnectionSettingsSchema,
  rTorrentConnectionSettingsSchema,
  rstorrentConnectionSettingsSchema,
  transmissionConnectionSettingsSchema,
]);

export type ClientConnectionSettings = zodInfer<typeof clientConnectionSettingsSchema>;
