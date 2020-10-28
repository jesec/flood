export enum TransmissionPriority {
  TR_PRI_LOW = -1,
  TR_PRI_NORMAL = 0,
  TR_PRI_HIGH = 1,
}

interface TransmissionTorrentContent {
  bytesCompleted: number;
  length: number;
  name: string;
}

// a file's non-constant properties.
interface TransmissionTorrentContentStats {
  bytesCompleted: number;
  wanted: boolean;
  priority: TransmissionPriority;
}

export enum TransmissionTorrentError {
  // everything's fine
  TR_STAT_OK = 0,
  // when we anounced to the tracker, we got a warning in the response
  TR_STAT_TRACKER_WARNING = 1,
  // when we anounced to the tracker, we got an error in the response
  TR_STAT_TRACKER_ERROR = 2,
  // local trouble, such as disk full or permissions error
  TR_STAT_LOCAL_ERROR = 3,
}

export enum TransmissionTorrentStatus {
  // Torrent is stopped
  TR_STATUS_STOPPED = 0,
  // Queued to check files
  TR_STATUS_CHECK_WAIT = 1,
  // Checking files
  TR_STATUS_CHECK = 2,
  // Queued to download
  TR_STATUS_DOWNLOAD_WAIT = 3,
  // Downloading
  TR_STATUS_DOWNLOAD = 4,
  // Queued to seed
  TR_STATUS_SEED_WAIT = 5,
  // Seeding
  TR_STATUS_SEED = 6,
}

interface TransmissionTorrentPeer {
  address: string;
  clientName: string;
  clientIsChoked: boolean;
  clientIsInterested: boolean;
  flagStr: string;
  isDownloadingFrom: boolean;
  isEncrypted: boolean;
  isIncoming: boolean;
  isUploadingTo: boolean;
  isUTP: boolean;
  peerIsChoked: boolean;
  peerIsInterested: boolean;
  port: number;
  progress: number;
  // B/s
  rateToClient: number;
  // B/s
  rateToPeer: number;
}

interface TransmissionTorrentPeersFrom {
  fromCache: number;
  fromDht: number;
  fromIncoming: number;
  fromLpd: number;
  fromLtep: number;
  fromPex: number;
  fromTracker: number;
}

interface TransmissionTorrentTracker {
  announce: string;
  id: number;
  scrape: string;
  tier: number;
}

interface TransmissionTorrentTrackerStats {
  announce: string;
  announceState: number;
  downloadCount: number;
  hasAnnounced: boolean;
  hasScraped: boolean;
  host: string;
  id: number;
  isBackup: boolean;
  lastAnnouncePeerCount: number;
  lastAnnounceResult: string;
  lastAnnounceStartTime: number;
  lastAnnounceSucceeded: boolean;
  lastAnnounceTime: number;
  lastAnnounceTimedOut: boolean;
  lastScrapeResult: string;
  lastScrapeStartTime: number;
  lastScrapeSucceeded: boolean;
  lastScrapeTime: number;
  lastScrapeTimedOut: boolean;
  leecherCount: number;
  nextAnnounceTime: number;
  nextScrapeTime: number;
  scrape: string;
  scrapeState: number;
  seederCount: number;
  tier: number;
}

export interface TransmissionTorrentProperties {
  // The last time we uploaded or downloaded piece data on this torrent.
  activityDate: number;
  // When the torrent was first added.
  addedDate: number;
  bandwidthPriority: TransmissionPriority;
  comment: string;
  // Byte count of all the corrupt data you've ever downloaded for this torrent.
  corruptEver: number;
  creator: string;
  dateCreated: number;
  // Byte count of all the piece data we want and don't have yet, but that a connected peer does have. [0...leftUntilDone]
  desiredAvailable: number;
  // When the torrent finished downloading.
  doneDate: number;
  downloadDir: string;
  // Byte count of all the non-corrupt data you've ever downloaded for this torrent.
  downloadedEver: number;
  downloadLimit: number;
  downloadLimited: boolean;
  // The last time during this session that a rarely-changing field changed.
  editDate: number;
  error: TransmissionTorrentError;
  // A warning or error message regarding the torrent.
  errorString: string;
  // If downloading, estimated number of seconds left until the torrent is done.
  // If seeding, estimated number of seconds left until seed ratio is reached.
  eta: number;
  // If seeding, number of seconds left until the idle time limit is reached.
  etaIdle: number;
  'file-count': number;
  files: Array<TransmissionTorrentContent>;
  fileStats: Array<TransmissionTorrentContentStats>;
  hashString: string;
  // Byte count of all the partial piece data we have for this torrent. As pieces become complete,
  // this value may decrease as portions of it are moved to `corrupt' or `haveValid'.
  haveUnchecked: number;
  // Byte count of all the checksum-verified data we have for this torrent.
  haveValid: number;
  honorsSessionLimits: boolean;
  // IDs are good as simple lookup keys, but are not persistent between sessions.
  id: number;
  isFinished: boolean;
  isPrivate: boolean;
  isStalled: boolean;
  labels: Array<string>;
  // Byte count of how much data is left to be downloaded until we've got all the pieces that we want. [0...tr_info.sizeWhenDone]
  leftUntilDone: number;
  magnetLink: string;
  // time when one or more of the torrent's trackers will allow you to manually ask for more peers, or 0 if you can't.
  manualAnnounceTime: number;
  maxConnectedPeers: number;
  // How much of the metadata the torrent has. For torrents added from a .torrent this will always be 1.
  // For magnet links, this number will from from 0 to 1 as the metadata is downloaded. Range is [0..1]
  metadataPercentComplete: number;
  // The torrent's name.
  name: string;
  'peer-limit': number;
  peers: Array<TransmissionTorrentPeer>;
  // Number of peers that we're connected to
  peersConnected: number;
  // How many peers we found out about from the tracker, or from pex, or from incoming connections, or from our resume file.
  peersFrom: TransmissionTorrentPeersFrom;
  // Number of peers that we're sending data to
  peersGettingFromUs: number;
  // Number of peers that are sending data to us.
  peersSendingToUs: number;
  // How much has been downloaded of the files the user wants. This differs from percentComplete
  // if the user wants only some of the torrent's files. Range is [0..1]
  percentDone: number;
  // A bitfield holding pieceCount flags which are set to 'true' if we have the piece matching
  // that position. This is a base64-encoded string.
  pieces: string;
  pieceCount: number;
  pieceSize: number;
  // an array of tr_info.filecount numbers. each is the tr_priority_t mode for the corresponding file.
  priorities: Array<TransmissionPriority>;
  'primary-mime-type': string;
  // This torrent's queue position. All torrents have a queue position, even if it's not queued.
  queuePosition: number;
  // B/s
  rateDownload: number;
  // B/s
  rateUpload: number;
  // When tr_stat.activity is TR_STATUS_CHECK or TR_STATUS_CHECK_WAIT, this is the percentage of
  // how much of the files has been verified. When it gets to 1, the verify process is done. Range is [0..1]
  recheckProgress: number;
  // Cumulative seconds the torrent's ever spent downloading
  secondsDownloading: number;
  // Cumulative seconds the torrent's ever spent seeding
  secondsSeeding: number;
  seedIdleLimit: number;
  seedIdleMode: number;
  seedRatioLimit: number;
  seedRatioMode: number;
  // Byte count of all the piece data we'll have downloaded when we're done, whether or not we have
  // it yet. This may be less than tr_info.totalSize if only some of the torrent's files are wanted. [0...tr_info.totalSize]
  sizeWhenDone: number;
  // When the torrent was last started.
  startDate: number;
  status: TransmissionTorrentStatus;
  trackers: Array<TransmissionTorrentTracker>;
  trackerStats: Array<TransmissionTorrentTrackerStats>;
  // total size of the torrent, in bytes
  totalSize: number;
  torrentFile: string;
  // Byte count of all data you've ever uploaded for this torrent.
  uploadedEver: number;
  uploadLimit: number;
  uploadLimited: boolean;
  uploadRatio: number;
  // an array of tr_info.fileCount 'booleans' true if the corresponding file is to be downloaded.
  wanted: Array<boolean>;
  webseeds: Array<string>;
  // Number of webseeds that are sending data to us.
  webseedsSendingToUs: number;
}

// number representing torrent id or string representing torrent hash or an array thereof.
export type TransmissionTorrentIDs = Array<string | number> | string | number;

// Method name: "torrent-get"
export interface TransmissionTorrentsGetArguments {
  // torrent list. All torrents are used if the "ids" argument is omitted.
  ids?: TransmissionTorrentIDs;
  // fields to be fetched.
  fields: Array<keyof TransmissionTorrentProperties>;
  // how to format the "torrents" response field.
  format: 'objects' | 'table';
}

// Method name: "torrent-set"
export interface TransmissionTorrentsSetArguments {
  // torrent list. All torrents are used if the "ids" argument is omitted.
  ids?: TransmissionTorrentIDs;
  // this torrent's bandwidth tr_priority_t
  bandwidthPriority?: TransmissionPriority;
  // maximum download speed (KBps)
  downloadLimit?: number;
  // true if "downloadLimit" is honored
  downloadLimited?: boolean;
  // indices of file(s) to download
  'files-wanted'?: Array<number>;
  // indices of file(s) to not download
  'files-unwanted'?: Array<number>;
  // true if session upload limits are honored
  honorsSessionLimits?: boolean;
  // array of string labels
  labels?: Array<string>;
  // new location of the torrent's content
  location?: string;
  // maximum number of peers
  'peer-limit'?: number;
  // indices of high-priority file(s)
  'priority-high'?: Array<number>;
  // indices of low-priority file(s)
  'priority-low'?: Array<number>;
  // indices of normal-priority file(s)
  'priority-normal'?: Array<number>;
  // position of this torrent in its queue [0...n)
  queuePosition?: number;
  // torrent-level number of minutes of seeding inactivity
  seedIdleLimit?: number;
  // which seeding inactivity to use.  See tr_idlelimit
  seedIdleMode?: number;
  // torrent-level seeding ratio
  seedRatioLimit?: number;
  // which ratio to use.  See tr_ratiolimit
  seedRatioMode?: number;
  // strings of announce URLs to add
  trackerAdd?: Array<string>;
  // ids of trackers to remove
  trackerRemove?: Array<number>;
  // pairs of <trackerId/new announce URLs>, [0, url, 1, url, ...]
  trackerReplace?: Array<number | string>;
  // maximum upload speed (KBps)
  uploadLimit?: number;
  // true if "uploadLimit" is honored
  uploadLimited?: boolean;
}

// Method name: "torrent-add"
interface TransmissionTorrentAddCommonArguments {
  // path to download the torrent to
  'download-dir'?: string;
  // if true, don't start the torrent
  paused?: boolean;
  // maximum number of peers
  'peer-limit'?: number;
  // torrent's bandwidth tr_priority_t
  bandwidthPriority?: TransmissionPriority;
  // indices of file(s) to download
  'files-wanted'?: Array<number>;
  // indices of file(s) to not download
  'files-unwanted'?: Array<number>;
  // indices of high-priority file(s)
  'priority-high'?: Array<number>;
  // indices of low-priority file(s)
  'priority-low'?: Array<number>;
  // indices of normal-priority file(s)
  'priority-normal'?: Array<number>;
}

interface TransmissionTorrentAddByURLArguments extends TransmissionTorrentAddCommonArguments {
  // filename or URL of the .torrent file
  filename: string;
  // pointer to a string of one or more cookies.
  // The format of the "cookies" should be NAME=CONTENTS, where NAME is the cookie name and CONTENTS
  // is what the cookie should contain. Set multiple cookies like this: "name1=content1; name2=content2;".
  cookies?: string;
}

interface TransmissionTorrentAddByFileArguments extends TransmissionTorrentAddCommonArguments {
  // base64-encoded .torrent content
  metainfo: string;
}

export type TransmissionTorrentAddArguments =
  | TransmissionTorrentAddByURLArguments
  | TransmissionTorrentAddByFileArguments;

// Method name: "torrent-remove"
export interface TransmissionTorrentsRemoveArguments {
  ids: TransmissionTorrentIDs;
  // delete local data. (default: false)
  'delete-local-data'?: boolean;
}

// Method name: "torrent-set-location"
export interface TransmissionTorrentsSetLocationArguments {
  ids: TransmissionTorrentIDs;
  // the new torrent location
  location: string;
  // if true, move from previous location. otherwise, search "location" for files. (default: false)
  move?: boolean;
}

// Method name: "torrent-rename-path"
export interface TransmissionTorrentRenamePathArguments {
  // must only be 1 torrent
  ids: TransmissionTorrentIDs;
  // the path to the file or folder that will be renamed
  path: string;
  // the file or folder's new name
  name: string;
}
