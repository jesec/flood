/**
 * Test fixtures and utilities for Storybook stories
 */

import type {FloodSettings} from '@shared/types/FloodSettings';
import type {Notification} from '@shared/types/Notification';
import type {TorrentProperties} from '@shared/types/Torrent';
import {TorrentPriority} from '@shared/types/Torrent';
import type {TorrentContent} from '@shared/types/TorrentContent';
import {TorrentContentPriority} from '@shared/types/TorrentContent';
import type {TorrentPeer} from '@shared/types/TorrentPeer';
import type {TorrentTracker} from '@shared/types/TorrentTracker';
import {TorrentTrackerType} from '@shared/types/TorrentTracker';

/**
 * Time constants in milliseconds
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Size constants in bytes
 */
export const SIZE = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024,
} as const;

/**
 * Speed constants in bytes per second
 */
export const SPEED = {
  KB_PER_SEC: 1024,
  MB_PER_SEC: 1024 * 1024,
  GB_PER_SEC: 1024 * 1024 * 1024,
} as const;

/**
 * Realistic tracker domains
 */
export const MOCK_TRACKERS = [
  'http://tracker.opentrackr.org:1337/announce',
  'udp://tracker.openbittorrent.com:6969/announce',
  'http://tracker.ubuntu.com:6969/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'http://bt.t-ru.org/ann',
  'udp://explodie.org:6969/announce',
  'http://tracker.dler.org:6969/announce',
  'udp://tracker.coppersurfer.tk:6969/announce',
  'http://tracker.leechers-paradise.org:6969/announce',
  'udp://9.rarbg.to:2710/announce',
] as const;

/**
 * Realistic download directories
 */
export const MOCK_DIRECTORIES = [
  '/downloads',
  '/downloads/movies',
  '/downloads/music',
  '/downloads/software',
  '/downloads/books',
  '/mnt/data/torrents',
  '/media/downloads',
  '/home/user/Downloads',
] as const;

/**
 * Realistic torrent names by category
 */
export const MOCK_TORRENT_NAMES = {
  linux: [
    'Ubuntu 22.04.3 Desktop amd64.iso',
    'Fedora-Workstation-Live-x86_64-39.iso',
    'debian-12.2.0-amd64-netinst.iso',
    'archlinux-2024.01.01-x86_64.iso',
    'LinuxMint-21.3-cinnamon-64bit.iso',
  ],
  software: [
    'LibreOffice_7.6.4_Win_x86-64.msi',
    'GIMP-2.10.36-setup.exe',
    'Blender-4.0.2-windows-x64.zip',
    'VLC-3.0.20-win64.exe',
    'Firefox-121.0-Linux-x86_64.tar.bz2',
  ],
  media: [
    'Big_Buck_Bunny_1080p.mkv',
    'Sintel.2010.4K.mkv',
    'Creative_Commons_Music_Collection.flac',
    'Public_Domain_Classical_Music.zip',
    'OpenSource_Documentary.mp4',
  ],
} as const;

/**
 * Generate realistic torrent data with accurate calculations
 */
export function generateMockTorrent(overrides: Partial<TorrentProperties> = {}): TorrentProperties {
  const hash = overrides.hash || Math.random().toString(36).substring(2, 10).toUpperCase();

  // Base sizes
  const sizeBytes = overrides.sizeBytes || 3.5 * SIZE.GB;
  const bytesDone = overrides.bytesDone !== undefined ? overrides.bytesDone : sizeBytes * 0.567;
  const percentComplete =
    overrides.percentComplete !== undefined ? overrides.percentComplete : (bytesDone / sizeBytes) * 100;

  // Transfer totals
  const downTotal = overrides.downTotal !== undefined ? overrides.downTotal : bytesDone;
  const upTotal = overrides.upTotal !== undefined ? overrides.upTotal : bytesDone * 0.567;
  const ratio = downTotal > 0 ? upTotal / downTotal : 0;

  // Random selection of realistic data
  const trackerIndex = Math.floor(Math.random() * MOCK_TRACKERS.length);
  const dirIndex = Math.floor(Math.random() * MOCK_DIRECTORIES.length);
  const category = ['linux', 'software', 'media'][Math.floor(Math.random() * 3)] as keyof typeof MOCK_TORRENT_NAMES;
  const nameList = MOCK_TORRENT_NAMES[category];
  const nameIndex = Math.floor(Math.random() * nameList.length);

  const baseData: TorrentProperties = {
    hash,
    name: overrides.name || nameList[nameIndex],
    status: ['downloading', 'active'],
    bytesDone: Math.floor(bytesDone),
    comment: '',
    dateActive: -1, // Currently active
    dateAdded: Date.now() - TIME.HOUR,
    dateCreated: Date.now() - 30 * TIME.DAY,
    dateFinished: 0,
    directory: overrides.directory || MOCK_DIRECTORIES[dirIndex],
    downRate: SPEED.MB_PER_SEC,
    downTotal: Math.floor(downTotal),
    eta: percentComplete < 100 ? Math.floor((sizeBytes - bytesDone) / SPEED.MB_PER_SEC) : -1,
    isPrivate: false,
    isInitialSeeding: false,
    isSequential: false,
    message: '',
    peersConnected: 12,
    peersTotal: 50,
    percentComplete: Math.round(percentComplete * 100) / 100,
    priority: TorrentPriority.NORMAL,
    ratio: Math.round(ratio * 1000) / 1000,
    seedsConnected: 5,
    seedsTotal: 20,
    sizeBytes: Math.floor(sizeBytes),
    tags: [],
    trackerURIs: [MOCK_TRACKERS[trackerIndex]],
    upRate: 512 * SPEED.KB_PER_SEC,
    upTotal: Math.floor(upTotal),
  };

  return {...baseData, ...overrides};
}

/**
 * Mock torrent states for testing with accurate data
 */
export const MOCK_TORRENT_STATES = {
  downloading: (() => {
    const sizeBytes = 4 * SIZE.GB;
    const bytesDone = sizeBytes * 0.457; // 45.7%
    // BitTorrent: downTotal should be <= bytesDone (can be less due to discarded corrupt pieces)
    const downTotal = bytesDone - 5 * SIZE.MB; // Some pieces discarded
    const upTotal = bytesDone * 0.3; // Low ratio while downloading

    return generateMockTorrent({
      hash: 'DOWNLOADING001',
      name: 'Ubuntu 22.04.3 Desktop amd64.iso',
      status: ['downloading', 'active'],
      sizeBytes,
      bytesDone,
      percentComplete: 45.7,
      downRate: 2 * SPEED.MB_PER_SEC,
      downTotal,
      upRate: 512 * SPEED.KB_PER_SEC,
      upTotal,
      ratio: upTotal / downTotal,
      eta: Math.floor((sizeBytes - bytesDone) / (2 * SPEED.MB_PER_SEC)),
      dateActive: -1,
      // In BitTorrent, seeds are included in peer counts
      seedsConnected: 8,
      seedsTotal: 42,
      peersConnected: 25, // Total connected (includes seeds)
      peersTotal: 87, // Total available (includes seeds)
      tags: ['linux', 'iso', 'ubuntu'],
      directory: '/downloads/linux',
      trackerURIs: ['http://tracker.ubuntu.com:6969/announce', 'udp://tracker.openbittorrent.com:6969/announce'],
    });
  })(),

  seeding: (() => {
    const sizeBytes = 2.1 * SIZE.GB;
    const bytesDone = sizeBytes; // 100% complete
    const downTotal = sizeBytes;
    const upTotal = sizeBytes * 2.35; // Good ratio

    return generateMockTorrent({
      hash: 'SEEDING001',
      name: 'Fedora-Workstation-Live-x86_64-39.iso',
      status: ['seeding', 'complete', 'active'],
      sizeBytes,
      bytesDone,
      percentComplete: 100,
      downRate: 0,
      downTotal,
      upRate: 4 * SPEED.MB_PER_SEC,
      upTotal,
      ratio: 2.35,
      eta: -1,
      dateActive: -1,
      dateFinished: Date.now() - TIME.DAY,
      // When seeding, we connect to leechers (peers), not other seeds
      seedsConnected: 0, // We don't connect to seeds when seeding
      seedsTotal: 28, // Other seeds available
      peersConnected: 3, // Connected to 3 leechers
      peersTotal: 15, // Total leechers available
      tags: ['linux', 'fedora'],
      directory: '/downloads/linux',
      trackerURIs: ['http://tracker.opentrackr.org:1337/announce'],
    });
  })(),

  stopped: (() => {
    const sizeBytes = 628 * SIZE.MB;
    const bytesDone = sizeBytes * 0.352; // 35.2%
    const downTotal = bytesDone;
    const upTotal = bytesDone * 0.15;

    return generateMockTorrent({
      hash: 'STOPPED001',
      name: 'debian-12.2.0-amd64-netinst.iso',
      status: ['stopped', 'inactive'],
      sizeBytes,
      bytesDone,
      percentComplete: 35.2,
      downRate: 0,
      downTotal,
      upRate: 0,
      upTotal,
      ratio: upTotal / downTotal,
      eta: -1,
      dateActive: Date.now() - 2 * TIME.HOUR,
      peersConnected: 0,
      peersTotal: 0,
      seedsConnected: 0,
      seedsTotal: 0,
      tags: ['linux', 'debian', 'paused'],
      directory: '/downloads/linux',
      trackerURIs: ['udp://tracker.torrent.eu.org:451/announce'],
    });
  })(),

  error: (() => {
    const sizeBytes = 1.5 * SIZE.GB;
    const bytesDone = sizeBytes * 0.123; // 12.3%
    const downTotal = bytesDone;
    const upTotal = 0;

    return generateMockTorrent({
      hash: 'ERROR001',
      name: 'corrupted-archive.zip',
      status: ['error', 'stopped', 'inactive'],
      sizeBytes,
      bytesDone,
      percentComplete: 12.3,
      downRate: 0,
      downTotal,
      upRate: 0,
      upTotal,
      ratio: 0,
      message: 'Tracker gave HTTP response code 404 (Not Found)',
      eta: -1,
      dateActive: 0,
      peersConnected: 0,
      peersTotal: 0,
      seedsConnected: 0,
      seedsTotal: 0,
      tags: ['error'],
      directory: '/downloads/incomplete',
      trackerURIs: ['http://dead.tracker.com:6969/announce'],
    });
  })(),

  checking: (() => {
    const sizeBytes = 8.5 * SIZE.GB;
    const bytesDone = sizeBytes * 0.65; // 65% - amount checked/verified so far
    const downTotal = sizeBytes * 0.789; // Previously downloaded 78.9%
    const upTotal = downTotal * 0.8;

    return generateMockTorrent({
      hash: 'CHECKING001',
      name: 'large-archive.tar.gz',
      status: ['checking', 'active'],
      sizeBytes,
      bytesDone, // Amount verified so far during checking
      percentComplete: (bytesDone / sizeBytes) * 100, // Shows checking progress
      downRate: 0,
      downTotal,
      upRate: 0,
      upTotal,
      ratio: upTotal / downTotal,
      eta: Math.floor((sizeBytes - bytesDone) / (50 * SPEED.MB_PER_SEC)), // Time left to check
      dateActive: -1,
      peersConnected: 0,
      peersTotal: 0,
      seedsConnected: 0,
      seedsTotal: 0,
      tags: ['archive', 'verifying'],
      directory: '/downloads/archives',
      trackerURIs: ['udp://tracker.coppersurfer.tk:6969/announce'],
    });
  })(),

  queued: (() => {
    const sizeBytes = 350 * SIZE.MB;
    const bytesDone = 0;

    return generateMockTorrent({
      hash: 'QUEUED001',
      name: 'queued-download.mkv',
      status: ['stopped', 'inactive'],
      sizeBytes,
      bytesDone,
      percentComplete: 0,
      downRate: 0,
      downTotal: 0,
      upRate: 0,
      upTotal: 0,
      ratio: 0,
      eta: -1,
      dateActive: 0,
      dateAdded: Date.now() - 5 * TIME.MINUTE,
      peersConnected: 0,
      peersTotal: 45,
      seedsConnected: 0,
      seedsTotal: 12,
      tags: ['queued', 'media'],
      directory: '/downloads/media',
      trackerURIs: ['http://tracker.leechers-paradise.org:6969/announce'],
    });
  })(),
};

/**
 * Mock FloodSettings with all required fields
 */
export const MOCK_FLOOD_SETTINGS: FloodSettings = {
  language: 'en',
  sortTorrents: {
    direction: 'desc',
    property: 'dateAdded',
  },
  torrentListViewSize: 'expanded',
  torrentListColumns: [
    {id: 'name', visible: true},
    {id: 'percentComplete', visible: true},
    {id: 'downRate', visible: true},
    {id: 'upRate', visible: true},
    {id: 'eta', visible: true},
    {id: 'ratio', visible: true},
    {id: 'sizeBytes', visible: true},
    {id: 'tags', visible: true},
  ],
  torrentListColumnWidths: {
    name: 200,
    percentComplete: 100,
    downRate: 100,
    upRate: 100,
    eta: 100,
    ratio: 80,
    sizeBytes: 100,
    tags: 120,
    dateActive: 100,
    dateAdded: 100,
    dateFinished: 100,
    downTotal: 100,
    peers: 60,
    seeds: 60,
    upTotal: 100,
    dateCreated: 100,
    directory: 200,
    hash: 150,
    isPrivate: 60,
    message: 150,
    trackerURIs: 200,
  },
  torrentContextMenuActions: [
    {id: 'start', visible: true},
    {id: 'stop', visible: true},
    {id: 'remove', visible: true},
    {id: 'checkHash', visible: true},
    {id: 'reannounce', visible: true},
    {id: 'setTaxonomy', visible: true},
    {id: 'move', visible: true},
    {id: 'setTrackers', visible: true},
    {id: 'torrentDetails', visible: true},
    {id: 'downloadContents', visible: true},
    {id: 'downloadMetainfo', visible: true},
    {id: 'generateMagnet', visible: true},
    {id: 'setInitialSeeding', visible: true},
    {id: 'setSequential', visible: true},
    {id: 'setPriority', visible: true},
  ],
  torrentDestinations: {
    '': '/downloads',
    linux: '/downloads/linux',
    media: '/downloads/media',
    software: '/downloads/software',
  },
  mountPoints: ['/downloads', '/mnt/data', '/media'],
  startTorrentsOnLoad: true,
  UITorrentsAddTab: 'by-url',
  UITagSelectorMode: 'multi',
  speedLimits: {
    download: [0, SIZE.KB * 256, SIZE.MB, SIZE.MB * 5, SIZE.MB * 10, SIZE.MB * 20, 0],
    upload: [0, SIZE.KB * 128, SIZE.KB * 512, SIZE.MB, SIZE.MB * 2, SIZE.MB * 5, 0],
  },
  deleteTorrentData: false,
  UIPageTitleSpeedEnabled: false,
};

/**
 * Mock client settings for testing
 */
export const MOCK_CLIENT_SETTINGS = {
  dht: true,
  dhtPort: 6881,
  directoryDefault: '/downloads',
  networkHttpMaxOpen: 50,
  networkLocalAddress: ['0.0.0.0'],
  networkMaxOpenFiles: 600,
  networkPortOpen: true,
  networkPortRandom: true,
  networkPortRange: '6881-6999',
  piecesHashOnCompletion: true,
  piecesMemoryMax: 256 * 1024 * 1024, // 256 MB
  protocolPex: true,
  throttleGlobalDownSpeed: 0,
  throttleGlobalUpSpeed: 0,
  throttleMaxPeersNormal: 200,
  throttleMaxPeersSeed: 50,
  throttleMaxDownloads: 5,
  throttleMaxDownloadsGlobal: 10,
  throttleMaxUploads: 5,
  throttleMaxUploadsGlobal: 10,
  throttleMinPeersNormal: 40,
  throttleMinPeersSeed: 10,
  trackersNumWant: 100,
};

/**
 * Mock speed limits
 */
export const MOCK_SPEED_LIMITS = {
  download: 10 * SIZE.MB, // 10 MB/s
  upload: 5 * SIZE.MB, // 5 MB/s
};

/**
 * Mock users for authentication
 */
export const MOCK_USERS = [
  {username: 'admin', level: 10},
  {username: 'user1', level: 5},
];

/**
 * Mock RSS feeds
 */
export const MOCK_FEEDS = [
  {
    type: 'feed' as const,
    _id: 'feed1',
    label: 'Ubuntu Releases',
    url: 'https://ubuntu.com/rss',
    interval: 15, // Minutes, not milliseconds!
    count: 12,
  },
  {
    type: 'feed' as const,
    _id: 'feed2',
    label: 'Fedora Torrents',
    url: 'https://fedora.org/rss',
    interval: 30, // Minutes, not milliseconds!
    count: 8,
  },
];

/**
 * Mock feed rules
 */
export const MOCK_FEED_RULES = [
  {
    type: 'rule' as const,
    _id: 'rule1',
    label: 'Download Ubuntu ISOs',
    feedIDs: ['feed1'],
    field: 'title',
    match: 'ubuntu.*desktop.*amd64',
    exclude: '',
    destination: '/downloads/ubuntu',
    tags: ['linux', 'ubuntu'],
    startOnLoad: true,
    isBasePath: false,
    count: 3,
  },
];

/**
 * Mock feed items
 */
export const MOCK_FEED_ITEMS = [
  {
    title: 'Ubuntu 22.04.3 Desktop amd64',
    urls: ['https://ubuntu.com/download/desktop/ubuntu-22.04.3-desktop-amd64.iso.torrent'],
  },
  {
    title: 'Ubuntu Server 22.04.3 amd64',
    urls: ['https://ubuntu.com/download/server/ubuntu-22.04.3-server-amd64.iso.torrent'],
  },
];

/**
 * Mock disk usage data
 */
export const MOCK_DISK_USAGE = [
  {
    target: '/',
    size: 1000 * 1024 * 1024 * 1024, // 1TB
    used: 600 * 1024 * 1024 * 1024, // 600GB used
    avail: 400 * 1024 * 1024 * 1024, // 400GB available
  },
];

/**
 * Mock directory list for file browser
 */
export const MOCK_DIRECTORY_LIST = {
  '/': ['downloads', 'documents', 'media'],
  '/downloads': ['linux', 'software', 'media'],
  '/downloads/linux': ['ubuntu', 'fedora', 'debian'],
};

/**
 * Mock torrent action speeds
 */
export const MOCK_TORRENT_SPEEDS = {
  DOWNLOADING: 2 * SIZE.MB, // Download speed when torrent starts downloading
  UPLOADING: 512 * SIZE.KB, // Upload speed when torrent is active
  CHECKING: 50 * SIZE.MB, // Speed when checking torrent integrity
};

/**
 * Mock torrent content files
 */
export const MOCK_TORRENT_CONTENTS: TorrentContent[] = [
  {
    index: 0,
    path: 'video/movie.mkv',
    filename: 'movie.mkv',
    percentComplete: 100,
    priority: TorrentContentPriority.NORMAL,
    sizeBytes: 2 * SIZE.GB,
  },
  {
    index: 1,
    path: 'video/subtitle.srt',
    filename: 'subtitle.srt',
    percentComplete: 100,
    priority: TorrentContentPriority.NORMAL,
    sizeBytes: 64 * SIZE.KB,
  },
  {
    index: 2,
    path: 'info.txt',
    filename: 'info.txt',
    percentComplete: 100,
    priority: TorrentContentPriority.HIGH,
    sizeBytes: 4 * SIZE.KB,
  },
];

/**
 * Mock torrent peers
 */
export const MOCK_TORRENT_PEERS: TorrentPeer[] = [
  {
    address: '192.168.1.100:51234',
    country: 'US',
    clientVersion: 'qBittorrent 4.5.0',
    completedPercent: 45,
    downloadRate: 524288,
    uploadRate: 262144,
    isEncrypted: true,
    isIncoming: false,
  },
  {
    address: '10.0.0.50:49999',
    country: 'DE',
    clientVersion: 'Transmission 3.0',
    completedPercent: 100,
    downloadRate: 0,
    uploadRate: SIZE.MB,
    isEncrypted: false,
    isIncoming: true,
  },
  {
    address: '172.16.0.25:6881',
    country: 'JP',
    clientVersion: 'Deluge 2.1.1',
    completedPercent: 78,
    downloadRate: 102400,
    uploadRate: 51200,
    isEncrypted: true,
    isIncoming: false,
  },
];

/**
 * Mock torrent trackers beyond the basic ones
 */
export const MOCK_TORRENT_TRACKER_LIST: TorrentTracker[] = [
  {
    url: 'http://tracker.opentrackr.org:1337/announce',
    type: TorrentTrackerType.HTTP,
  },
  {
    url: 'udp://tracker.openbittorrent.com:6969/announce',
    type: TorrentTrackerType.UDP,
  },
  {
    url: 'dht://router.bittorrent.com:6881',
    type: TorrentTrackerType.DHT,
  },
];

/**
 * Mock mediainfo output
 */
export const MOCK_MEDIAINFO_OUTPUT = `General
Unique ID                                : 123456789012345678901234567890123456
Complete name                            : movie.mkv
Format                                   : Matroska
Format version                           : Version 4
File size                                : 2.00 GiB
Duration                                 : 2 h 15 min
Overall bit rate                         : 2 117 kb/s
Movie name                               : Example Movie
Encoded date                             : 2023-01-01 00:00:00 UTC
Writing application                      : mkvmerge v70.0.0
Writing library                          : libebml v1.4.4 + libmatroska v1.7.1

Video
ID                                       : 1
Format                                   : AVC
Format/Info                              : Advanced Video Codec
Duration                                 : 2 h 15 min
Bit rate                                 : 1 500 kb/s
Width                                    : 1 920 pixels
Height                                   : 1 080 pixels
Display aspect ratio                     : 16:9
Frame rate mode                          : Constant
Frame rate                               : 23.976 (24000/1001) FPS

Audio
ID                                       : 2
Format                                   : AAC LC
Duration                                 : 2 h 15 min
Bit rate mode                            : Constant
Bit rate                                 : 192 kb/s
Channel(s)                               : 2 channels
Sampling rate                            : 48.0 kHz`;

/**
 * Template for creating a new torrent
 */
export function createNewTorrentTemplate(
  hash: string,
  options?: {
    name?: string;
    destination?: string;
    tags?: string[];
    start?: boolean;
    comment?: string;
    sizeBytes?: number;
  },
): TorrentProperties {
  const start = options?.start ?? false;
  return {
    hash,
    name: options?.name ?? `New Torrent ${new Date().toLocaleTimeString()}`,
    status: start ? ['downloading', 'active'] : ['stopped', 'inactive'],
    bytesDone: 0,
    comment: options?.comment ?? '',
    dateActive: start ? -1 : 0,
    dateAdded: Date.now(),
    dateCreated: Date.now(),
    dateFinished: 0,
    directory: options?.destination ?? '/downloads',
    downRate: start ? MOCK_TORRENT_SPEEDS.DOWNLOADING : 0,
    downTotal: 0,
    eta: start ? 7200 : -1,
    isPrivate: false,
    isInitialSeeding: false,
    isSequential: false,
    message: '',
    peersConnected: start ? 5 : 0,
    peersTotal: 20,
    percentComplete: 0,
    priority: TorrentPriority.NORMAL,
    ratio: 0,
    seedsConnected: start ? 2 : 0,
    seedsTotal: 10,
    sizeBytes: options?.sizeBytes ?? 5 * SIZE.GB,
    tags: options?.tags ?? [],
    trackerURIs: ['http://tracker.example.com:6969/announce'],
    upRate: 0,
    upTotal: 0,
  };
}

/**
 * Mock notifications for testing notification system
 */
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notification.torrent.finished' as const,
    ts: Date.now() - 60000, // 1 minute ago
    read: false,
    data: {
      name: 'Ubuntu 23.10 Desktop amd64',
    },
  },
  {
    id: 'notification.torrent.finished' as const,
    ts: Date.now() - 300000, // 5 minutes ago
    read: true,
    data: {
      name: 'Fedora-Workstation-Live-x86_64-39',
    },
  },
  {
    id: 'notification.torrent.errored' as const,
    ts: Date.now() - 600000, // 10 minutes ago
    read: false,
    data: {
      name: 'Big Buck Bunny 1080p',
    },
  },
];
