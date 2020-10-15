import type {FloodSettings} from '@shared/types/FloodSettings';

const defaultFloodSettings: Readonly<FloodSettings> = {
  language: 'auto',
  sortTorrents: {
    direction: 'desc',
    property: 'dateAdded',
  },
  torrentListColumns: [
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
    {id: 'dateAdded', visible: true},
    {id: 'dateCreated', visible: false},
    {id: 'basePath', visible: false},
    {id: 'hash', visible: false},
    {id: 'isPrivate', visible: false},
    {id: 'message', visible: false},
    {id: 'trackerURIs', visible: false},
    {id: 'tags', visible: true},
  ],
  torrentListColumnWidths: {
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
    dateAdded: 100,
    dateCreated: 100,
    basePath: 100,
    hash: 100,
    isPrivate: 100,
    message: 100,
    trackerURIs: 100,
    tags: 100,
  },
  torrentContextMenuActions: [
    {id: 'start', visible: true},
    {id: 'stop', visible: true},
    {id: 'remove', visible: true},
    {id: 'checkHash', visible: true},
    {id: 'setTaxonomy', visible: true},
    {id: 'move', visible: true},
    {id: 'setTracker', visible: false},
    {id: 'torrentDetails', visible: true},
    {id: 'torrentDownload', visible: true},
    {id: 'setPriority', visible: false},
  ],
  torrentListViewSize: 'condensed',
  speedLimits: {
    download: [1024, 10240, 102400, 512000, 1048576, 2097152, 5242880, 10485760, 0],
    upload: [1024, 10240, 102400, 512000, 1048576, 2097152, 5242880, 10485760, 0],
  },
  startTorrentsOnLoad: false,
  mountPoints: [],
};

export default defaultFloodSettings;
