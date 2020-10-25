const TorrentContextMenuActions = {
  start: {
    id: 'torrents.list.context.start',
  },
  stop: {
    id: 'torrents.list.context.stop',
  },
  remove: {
    id: 'torrents.list.context.remove',
  },
  checkHash: {
    id: 'torrents.list.context.check.hash',
  },
  setTaxonomy: {
    id: 'torrents.list.context.set.tags',
  },
  move: {
    id: 'torrents.list.context.move',
  },
  setTrackers: {
    id: 'torrents.list.context.set.trackers',
  },
  torrentDetails: {
    id: 'torrents.list.context.details',
  },
  torrentDownload: {
    id: 'torrents.list.context.download',
  },
  setPriority: {
    id: 'torrents.list.context.priority',
  },
} as const;

export default TorrentContextMenuActions;
export type TorrentContextMenuAction = keyof typeof TorrentContextMenuActions;
