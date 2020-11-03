const TorrentListColumns = {
  dateAdded: {
    id: 'torrents.properties.date.added',
  },
  downRate: {
    id: 'torrents.properties.download.speed',
  },
  downTotal: {
    id: 'torrents.properties.download.total',
  },
  eta: {
    id: 'torrents.properties.eta',
  },
  name: {
    id: 'torrents.properties.name',
  },
  peers: {
    id: 'torrents.properties.peers',
  },
  percentComplete: {
    id: 'torrents.properties.percentage',
  },
  ratio: {
    id: 'torrents.properties.ratio',
  },
  seeds: {
    id: 'torrents.properties.seeds',
  },
  sizeBytes: {
    id: 'torrents.properties.size',
  },
  tags: {
    id: 'torrents.properties.tags',
  },
  upRate: {
    id: 'torrents.properties.upload.speed',
  },
  upTotal: {
    id: 'torrents.properties.upload.total',
  },
  dateCreated: {
    id: 'torrents.properties.creation.date',
  },
  directory: {
    id: 'torrents.properties.directory',
  },
  hash: {
    id: 'torrents.properties.hash',
  },
  isPrivate: {
    id: 'torrents.properties.is.private',
  },
  message: {
    id: 'torrents.properties.tracker.message',
  },
  trackerURIs: {
    id: 'torrents.properties.trackers',
  },
} as const;

export default TorrentListColumns;
export type TorrentListColumn = keyof typeof TorrentListColumns;
