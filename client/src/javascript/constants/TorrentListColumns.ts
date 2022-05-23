const TorrentListColumns = {
  dateAdded: 'torrents.properties.date.added',
  dateFinished: 'torrents.properties.date.finished',
  downRate: 'torrents.properties.download.speed',
  downTotal: 'torrents.properties.download.total',
  eta: 'torrents.properties.eta',
  name: 'torrents.properties.name',
  peers: 'torrents.properties.peers',
  percentComplete: 'torrents.properties.percentage',
  ratio: 'torrents.properties.ratio',
  seeds: 'torrents.properties.seeds',
  sizeBytes: 'torrents.properties.size',
  tags: 'torrents.properties.tags',
  upRate: 'torrents.properties.upload.speed',
  upTotal: 'torrents.properties.upload.total',
  dateCreated: 'torrents.properties.date.created',
  directory: 'torrents.properties.directory',
  hash: 'torrents.properties.hash',
  isPrivate: 'torrents.properties.is.private',
  message: 'torrents.properties.tracker.message',
  trackerURIs: 'torrents.properties.trackers',
} as const;

export default TorrentListColumns;
export type TorrentListColumn = keyof typeof TorrentListColumns;
