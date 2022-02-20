import jsonpatch, {Operation} from 'fast-json-patch';

import BaseService from './BaseService';
import torrentStatusMap from '../../shared/constants/torrentStatusMap';

import type {Taxonomy, LocationTreeNode} from '../../shared/types/Taxonomy';
import type {TorrentStatus} from '../../shared/constants/torrentStatusMap';
import type {TorrentProperties, TorrentList} from '../../shared/types/Torrent';

type TaxonomyServiceEvents = {
  TAXONOMY_DIFF_CHANGE: (payload: {id: number; diff: Operation[]}) => void;
};

class TaxonomyService extends BaseService<TaxonomyServiceEvents> {
  taxonomy: Taxonomy = {
    locationCounts: {'': 0},
    locationSizes: {},
    locationTree: [],
    statusCounts: {'': 0},
    tagCounts: {'': 0, untagged: 0},
    tagSizes: {},
    trackerCounts: {'': 0},
    trackerSizes: {},
  };

  lastTaxonomy: Taxonomy = this.taxonomy;

  constructor(...args: ConstructorParameters<typeof BaseService>) {
    super(...args);

    this.onServicesUpdated = () => {
      if (this.services?.clientGatewayService == null) {
        return;
      }

      const {clientGatewayService} = this.services;

      clientGatewayService.on('PROCESS_TORRENT_LIST_START', this.handleProcessTorrentListStart);
      clientGatewayService.on('PROCESS_TORRENT_LIST_END', this.handleProcessTorrentListEnd);
      clientGatewayService.on('PROCESS_TORRENT', this.handleProcessTorrent);
    };
  }

  async destroy(drop: boolean) {
    if (this.services?.clientGatewayService == null) {
      return;
    }

    const {clientGatewayService} = this.services;

    clientGatewayService.removeListener('PROCESS_TORRENT_LIST_START', this.handleProcessTorrentListStart);
    clientGatewayService.removeListener('PROCESS_TORRENT_LIST_END', this.handleProcessTorrentListEnd);
    clientGatewayService.removeListener('PROCESS_TORRENT', this.handleProcessTorrent);

    super.destroy(drop);
  }

  getTaxonomy() {
    return {
      id: Date.now(),
      taxonomy: this.taxonomy,
    };
  }

  handleProcessTorrentListStart = () => {
    this.lastTaxonomy = {
      locationCounts: {...this.taxonomy.locationCounts},
      locationSizes: {...this.taxonomy.locationCounts},
      locationTree: [...this.taxonomy.locationTree],
      statusCounts: {...this.taxonomy.statusCounts},
      tagCounts: {...this.taxonomy.tagCounts},
      tagSizes: {...this.taxonomy.tagSizes},
      trackerCounts: {...this.taxonomy.trackerCounts},
      trackerSizes: {...this.taxonomy.trackerSizes},
    };

    torrentStatusMap.forEach((status) => {
      this.taxonomy.statusCounts[status] = 0;
    });

    this.taxonomy.locationCounts = {'': 0};
    this.taxonomy.locationSizes = {};
    this.taxonomy.locationTree = [];
    this.taxonomy.statusCounts[''] = 0;
    this.taxonomy.tagCounts = {'': 0, untagged: 0};
    this.taxonomy.tagSizes = {};
    this.taxonomy.trackerCounts = {'': 0};
    this.taxonomy.trackerSizes = {};
  };

  buildLocationTree = () => {
    const locations = Object.keys(this.taxonomy.locationCounts);
    const sortedLocations = locations.slice().sort((a, b) => {
      if (a === '') {
        return -1;
      }
      if (b === '') {
        return 1;
      }

      // Order slashes before similar paths with different symbols, eg. /files/PC/ should come before /files/PC-98/ for treeing
      return a.replace(/[^\\/\w]/g, '~').localeCompare(b.replace(/[^\\/\w]/g, '~'));
    });

    const separator = sortedLocations.length < 2 || sortedLocations[1].includes('/') ? '/' : '\\';
    let previousLocation: LocationTreeNode;
    this.taxonomy.locationTree = sortedLocations.reduce((tree, filter) => {
      const directory = filter.split(separator).slice(-1)[0];
      const parentPath = filter.substring(0, filter.lastIndexOf(separator + directory));
      const location: LocationTreeNode = {directoryName: directory, fullPath: filter, children: []};
      while (previousLocation) {
        // Move up the tree to a matching parent
        if (!previousLocation.parent || previousLocation.fullPath === parentPath) {
          break;
        }
        previousLocation = previousLocation.parent;
      }
      if (previousLocation && previousLocation.fullPath === parentPath && parentPath !== '') {
        // Child
        location.parent = previousLocation;
        previousLocation.children.push(location);
      } else if (previousLocation && previousLocation.parent && previousLocation.parent.fullPath === parentPath) {
        // Sibling
        location.parent = previousLocation.parent;
        previousLocation.parent.children.push(location);
      } else {
        // Root
        tree.push(location);
      }
      previousLocation = location;
      return tree;
    }, [] as LocationTreeNode[]);
  };

  cleanLocationTree = (location: LocationTreeNode) => {
    location.parent = undefined;
    location.children.forEach(this.cleanLocationTree);
  };

  handleProcessTorrentListEnd = ({torrents}: {torrents: TorrentList}) => {
    const {length} = Object.keys(torrents);

    this.buildLocationTree();
    this.taxonomy.locationTree.forEach(this.cleanLocationTree);

    this.taxonomy.locationCounts[''] = length;
    this.taxonomy.statusCounts[''] = length;
    this.taxonomy.tagCounts[''] = length;
    this.taxonomy.trackerCounts[''] = length;

    const taxonomyDiffs = jsonpatch.compare(this.lastTaxonomy, this.taxonomy);

    if (taxonomyDiffs.length > 0) {
      this.emit('TAXONOMY_DIFF_CHANGE', {
        diff: taxonomyDiffs,
        id: Date.now(),
      });
    }
  };

  handleProcessTorrent = (torrentProperties: TorrentProperties) => {
    this.incrementLocationCountsAndSizes(torrentProperties.directory, torrentProperties.sizeBytes);
    this.incrementStatusCounts(torrentProperties.status);
    this.incrementTagCounts(torrentProperties.tags);
    this.incrementTagSizes(torrentProperties.tags, torrentProperties.sizeBytes);
    this.incrementTrackerCounts(torrentProperties.trackerURIs);
    this.incrementTrackerSizes(torrentProperties.trackerURIs, torrentProperties.sizeBytes);
  };

  incrementLocationCountsAndSizes(
    directory: TorrentProperties['directory'],
    sizeBytes: TorrentProperties['sizeBytes'],
  ) {
    const separator = directory.includes('/') ? '/' : '\\';
    const parts = directory.startsWith(separator) ? directory.split(separator).slice(1) : directory.split(separator);
    let heirarchy = '';

    if (this.taxonomy.locationCounts[heirarchy] != null) {
      this.taxonomy.locationCounts[heirarchy] += 1;
    } else {
      this.taxonomy.locationCounts[heirarchy] = 1;
    }
    if (this.taxonomy.locationSizes[heirarchy] != null) {
      this.taxonomy.locationSizes[heirarchy] += sizeBytes;
    } else {
      this.taxonomy.locationSizes[heirarchy] = sizeBytes;
    }

    parts.forEach((part) => {
      heirarchy += separator + part;
      if (this.taxonomy.locationCounts[heirarchy] != null) {
        this.taxonomy.locationCounts[heirarchy] += 1;
      } else {
        this.taxonomy.locationCounts[heirarchy] = 1;
      }
      if (this.taxonomy.locationSizes[heirarchy] != null) {
        this.taxonomy.locationSizes[heirarchy] += sizeBytes;
      } else {
        this.taxonomy.locationSizes[heirarchy] = sizeBytes;
      }
    });
  }

  incrementStatusCounts(statuses: Array<TorrentStatus>) {
    statuses.forEach((status) => {
      this.taxonomy.statusCounts[status] += 1;
    });
  }

  incrementTagCounts(tags: TorrentProperties['tags']) {
    if (tags.length === 0) {
      this.taxonomy.tagCounts.untagged += 1;
    }

    tags.forEach((tag) => {
      if (this.taxonomy.tagCounts[tag] != null) {
        this.taxonomy.tagCounts[tag] += 1;
      } else {
        this.taxonomy.tagCounts[tag] = 1;
      }
    });
  }

  incrementTagSizes(tags: TorrentProperties['tags'], sizeBytes: TorrentProperties['sizeBytes']) {
    tags.forEach((tag) => {
      if (this.taxonomy.tagSizes[tag] != null) {
        this.taxonomy.tagSizes[tag] += sizeBytes;
      } else {
        this.taxonomy.tagSizes[tag] = sizeBytes;
      }
    });
  }

  incrementTrackerCounts(trackers: TorrentProperties['trackerURIs']) {
    trackers.forEach((tracker) => {
      if (this.taxonomy.trackerCounts[tracker] != null) {
        this.taxonomy.trackerCounts[tracker] += 1;
      } else {
        this.taxonomy.trackerCounts[tracker] = 1;
      }
    });
  }

  incrementTrackerSizes(trackers: TorrentProperties['trackerURIs'], sizeBytes: TorrentProperties['sizeBytes']) {
    trackers.forEach((tracker) => {
      if (this.taxonomy.trackerSizes[tracker] != null) {
        this.taxonomy.trackerSizes[tracker] += sizeBytes;
      } else {
        this.taxonomy.trackerSizes[tracker] = sizeBytes;
      }
    });
  }
}

export default TaxonomyService;
