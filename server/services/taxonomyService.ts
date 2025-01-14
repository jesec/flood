import type {TorrentStatus} from '@shared/constants/torrentStatusMap';
import type {LocationTreeNode, Taxonomy} from '@shared/types/Taxonomy';
import type {TorrentList, TorrentProperties} from '@shared/types/Torrent';
import jsonpatch, {Operation} from 'fast-json-patch';

import torrentStatusMap from '../../shared/constants/torrentStatusMap';
import BaseService from './BaseService';

type TaxonomyServiceEvents = {
  TAXONOMY_DIFF_CHANGE: (payload: {id: number; diff: Operation[]}) => void;
};

class TaxonomyService extends BaseService<TaxonomyServiceEvents> {
  taxonomy: Taxonomy = {
    locationTree: {directoryName: '', fullPath: '', children: [], containedCount: 0, containedSize: 0},
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
      locationTree: {...this.taxonomy.locationTree},
      statusCounts: {...this.taxonomy.statusCounts},
      tagCounts: {...this.taxonomy.tagCounts},
      tagSizes: {...this.taxonomy.tagSizes},
      trackerCounts: {...this.taxonomy.trackerCounts},
      trackerSizes: {...this.taxonomy.trackerSizes},
    };

    torrentStatusMap.forEach((status) => {
      this.taxonomy.statusCounts[status] = 0;
    });

    this.taxonomy.locationTree = {directoryName: '', fullPath: '', children: [], containedCount: 0, containedSize: 0};
    this.taxonomy.statusCounts[''] = 0;
    this.taxonomy.tagCounts = {'': 0, untagged: 0};
    this.taxonomy.tagSizes = {};
    this.taxonomy.trackerCounts = {'': 0};
    this.taxonomy.trackerSizes = {};
  };

  handleProcessTorrentListEnd = ({torrents}: {torrents: TorrentList}) => {
    const {length} = Object.keys(torrents);

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

    const countSizeAndBytesForHierarchy = (parent: LocationTreeNode, pathSplit: string[]) => {
      const [nodeName, ...restOfPath] = pathSplit;
      let nodeRoot = parent.children.find((treeNode) => treeNode.directoryName === nodeName);
      if (!nodeRoot) {
        nodeRoot = {
          directoryName: nodeName,
          fullPath: parent.fullPath + separator + nodeName,
          children: [],
          containedCount: 0,
          containedSize: 0,
        };
        parent.children.push(nodeRoot);
      }
      nodeRoot.containedCount += 1;
      nodeRoot.containedSize += sizeBytes;

      if (restOfPath.length) {
        countSizeAndBytesForHierarchy(nodeRoot, restOfPath);
      }
    };

    const pathSplit = directory.startsWith(separator)
      ? directory.split(separator).slice(1)
      : directory.split(separator);

    countSizeAndBytesForHierarchy(this.taxonomy.locationTree, pathSplit);
    this.taxonomy.locationTree.containedCount += 1;
    this.taxonomy.locationTree.containedSize += sizeBytes;
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
