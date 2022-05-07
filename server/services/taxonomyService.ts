import jsonpatch, {Operation} from 'fast-json-patch';

import BaseService from './BaseService';
import torrentStatusMap from '../../shared/constants/torrentStatusMap';

import type {Taxonomy} from '../../shared/types/Taxonomy';
import type {TorrentStatus} from '../../shared/constants/torrentStatusMap';
import type {TorrentProperties, TorrentList} from '../../shared/types/Torrent';

type TaxonomyServiceEvents = {
  TAXONOMY_DIFF_CHANGE: (payload: {id: number; diff: Operation[]}) => void;
};

class TaxonomyService extends BaseService<TaxonomyServiceEvents> {
  taxonomy: Taxonomy = {
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
      statusCounts: {...this.taxonomy.statusCounts},
      tagCounts: {...this.taxonomy.tagCounts},
      tagSizes: {...this.taxonomy.tagSizes},
      trackerCounts: {...this.taxonomy.trackerCounts},
      trackerSizes: {...this.taxonomy.trackerSizes},
    };

    torrentStatusMap.forEach((status) => {
      this.taxonomy.statusCounts[status] = 0;
    });

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
    this.incrementStatusCounts(torrentProperties.status);
    this.incrementTagCounts(torrentProperties.tags);
    this.incrementTagSizes(torrentProperties.tags, torrentProperties.sizeBytes);
    this.incrementTrackerCounts(torrentProperties.trackerURIs);
    this.incrementTrackerSizes(torrentProperties.trackerURIs, torrentProperties.sizeBytes);
  };

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
