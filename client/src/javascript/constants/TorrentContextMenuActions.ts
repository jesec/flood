const TorrentContextMenuActions = {
  start: 'torrents.list.context.start',
  stop: 'torrents.list.context.stop',
  remove: 'torrents.list.context.remove',
  checkHash: 'torrents.list.context.check.hash',
  reannounce: 'torrents.list.context.reannounce',
  setTaxonomy: 'torrents.list.context.set.tags',
  move: 'torrents.list.context.move',
  setTrackers: 'torrents.list.context.set.trackers',
  torrentDetails: 'torrents.list.context.details',
  downloadContents: 'torrents.list.context.download.contents',
  downloadMetainfo: 'torrents.list.context.download.metainfo',
  generateMagnet: 'torrents.list.context.generate.magnet',
  setInitialSeeding: 'torrents.list.context.initial.seeding',
  setSequential: 'torrents.list.context.sequential',
  setPriority: 'torrents.list.context.priority',
} as const;

export default TorrentContextMenuActions;
export type TorrentContextMenuAction = keyof typeof TorrentContextMenuActions;
