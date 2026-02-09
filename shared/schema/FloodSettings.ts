import {z} from 'zod';

import Languages, {type Language} from '../../client/src/javascript/constants/Languages';
import TorrentContextMenuActions, {
  type TorrentContextMenuAction,
} from '../../client/src/javascript/constants/TorrentContextMenuActions';
import TorrentListColumns, {type TorrentListColumn} from '../../client/src/javascript/constants/TorrentListColumns';
import type {FloodSettings} from '../types/FloodSettings';

const languageKeys = Object.keys(Languages) as Array<Language>;
const torrentListColumnKeys = Object.keys(TorrentListColumns) as Array<TorrentListColumn>;
const torrentContextMenuActionKeys = Object.keys(TorrentContextMenuActions) as Array<TorrentContextMenuAction>;

const languageSchema = z.enum(languageKeys as [Language, ...Array<Language>]);
const torrentListColumnSchema = z.enum(torrentListColumnKeys as [TorrentListColumn, ...Array<TorrentListColumn>]);
const torrentContextMenuActionSchema = z.enum(
  torrentContextMenuActionKeys as [TorrentContextMenuAction, ...Array<TorrentContextMenuAction>],
);

export const floodSettingKeySchema = z.enum(
  Object.keys({
    language: true,
    sortTorrents: true,
    torrentListColumns: true,
    torrentListColumnWidths: true,
    torrentContextMenuActions: true,
    torrentListViewSize: true,
    speedLimits: true,
    mountPoints: true,
    deleteTorrentData: true,
    startTorrentsOnLoad: true,
    torrentDestinations: true,
    UITagSelectorMode: true,
    UITorrentsAddTab: true,
    UIPageTitleSpeedEnabled: true,
  }) as [keyof FloodSettings, ...Array<keyof FloodSettings>],
);

const sortTorrentsSchemaBase = z
  .object({
    direction: z.enum(['desc', 'asc']),
    property: torrentListColumnSchema,
  })
  .strict();

const sortTorrentsSchema = sortTorrentsSchemaBase.default({
  direction: 'desc',
  property: 'dateAdded',
});

const torrentListColumnItemSchema = z
  .object({
    id: torrentListColumnSchema,
    visible: z.boolean(),
  })
  .strict();

const torrentListColumnsSchema = z.array(torrentListColumnItemSchema).default([
  {id: 'name', visible: true},
  {id: 'percentComplete', visible: true},
  {id: 'downTotal', visible: true},
  {id: 'downRate', visible: true},
  {id: 'upTotal', visible: true},
  {id: 'upRate', visible: true},
  {id: 'eta', visible: true},
  {id: 'ratio', visible: true},
  {id: 'sizeBytes', visible: true},
  {id: 'peers', visible: true},
  {id: 'seeds', visible: true},
  {id: 'dateActive', visible: false},
  {id: 'dateAdded', visible: true},
  {id: 'dateCreated', visible: false},
  {id: 'dateFinished', visible: false},
  {id: 'directory', visible: false},
  {id: 'hash', visible: false},
  {id: 'isPrivate', visible: false},
  {id: 'message', visible: false},
  {id: 'trackerURIs', visible: false},
  {id: 'tags', visible: true},
]);

const torrentListColumnWidthShape = Object.fromEntries(
  torrentListColumnKeys.map((key) => [key, z.number().int().nonnegative()]),
) as Record<TorrentListColumn, z.ZodNumber>;

const torrentListColumnWidthsSchemaBase = z.object(torrentListColumnWidthShape).strict();

const torrentListColumnWidthsSchema = torrentListColumnWidthsSchemaBase.default({
  name: 200,
  percentComplete: 100,
  downTotal: 100,
  downRate: 100,
  upTotal: 100,
  upRate: 100,
  eta: 100,
  ratio: 100,
  sizeBytes: 100,
  peers: 100,
  seeds: 100,
  dateActive: 100,
  dateAdded: 100,
  dateCreated: 100,
  dateFinished: 100,
  directory: 100,
  hash: 100,
  isPrivate: 100,
  message: 100,
  trackerURIs: 100,
  tags: 100,
});

const torrentContextMenuActionItemSchema = z
  .object({
    id: torrentContextMenuActionSchema,
    visible: z.boolean(),
  })
  .strict();

const torrentContextMenuActionsSchema = z.array(torrentContextMenuActionItemSchema).default([
  {id: 'start', visible: true},
  {id: 'stop', visible: true},
  {id: 'remove', visible: true},
  {id: 'checkHash', visible: true},
  {id: 'reannounce', visible: false},
  {id: 'setTaxonomy', visible: true},
  {id: 'move', visible: true},
  {id: 'setTrackers', visible: false},
  {id: 'torrentDetails', visible: true},
  {id: 'downloadContents', visible: true},
  {id: 'downloadMetainfo', visible: false},
  {id: 'generateMagnet', visible: false},
  {id: 'setInitialSeeding', visible: false},
  {id: 'setSequential', visible: false},
  {id: 'setPriority', visible: false},
]);

const speedLimitsSchemaBase = z
  .object({
    download: z.array(z.number().int().nonnegative()),
    upload: z.array(z.number().int().nonnegative()),
  })
  .strict();

const speedLimitsSchema = speedLimitsSchemaBase.default({
  download: [1024, 10240, 102400, 512000, 1048576, 2097152, 5242880, 10485760, 0],
  upload: [1024, 10240, 102400, 512000, 1048576, 2097152, 5242880, 10485760, 0],
});

export const floodSettingsSchema = z.object({
  language: languageSchema.default('auto'),
  sortTorrents: sortTorrentsSchema,
  torrentListColumns: torrentListColumnsSchema,
  torrentListColumnWidths: torrentListColumnWidthsSchema,
  torrentContextMenuActions: torrentContextMenuActionsSchema,
  torrentListViewSize: z.enum(['condensed', 'expanded']).default('condensed'),
  speedLimits: speedLimitsSchema,
  mountPoints: z.array(z.string()).default([]),
  deleteTorrentData: z.boolean().default(true),
  startTorrentsOnLoad: z.boolean().default(true),
  torrentDestinations: z.record(z.string(), z.string()).optional(),
  UITagSelectorMode: z.enum(['single', 'multi']).optional(),
  UITorrentsAddTab: z.enum(['by-url', 'by-file', 'by-creation']).optional(),
  UIPageTitleSpeedEnabled: z.boolean().default(true),
});

export const defaultFloodSettings = floodSettingsSchema.parse({});
