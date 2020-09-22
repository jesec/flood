import BaseService from './BaseService';
import objectUtil from '../../shared/util/objectUtil';
import torrentStatusMap from '../../shared/constants/torrentStatusMap';

import type {Taxonomy, TaxonomyDiffs} from '../../shared/types/Taxonomy';
import type {TorrentStatus} from '../../shared/constants/torrentStatusMap';
import type {TorrentProperties, Torrents} from '../../shared/types/Torrent';

interface TaxonomyServiceEvents {
  TAXONOMY_DIFF_CHANGE: (payload: {id: number; diff: TaxonomyDiffs}) => void;
}

class TaxonomyService extends BaseService<TaxonomyServiceEvents> {
  taxonomy: Taxonomy = {
    statusCounts: {all: 0},
    tagCounts: {all: 0, untagged: 0},
    trackerCounts: {all: 0},
  };

  lastTaxonomy: Taxonomy = this.taxonomy;

  constructor(...args: ConstructorParameters<typeof BaseService>) {
    super(...args);

    this.handleProcessTorrent = this.handleProcessTorrent.bind(this);
    this.handleProcessTorrentListStart = this.handleProcessTorrentListStart.bind(this);
    this.handleProcessTorrentListEnd = this.handleProcessTorrentListEnd.bind(this);

    this.onServicesUpdated = () => {
      if (this.services == null || this.services.clientGatewayService == null) {
        return;
      }

      const {clientGatewayService} = this.services;

      clientGatewayService.on('PROCESS_TORRENT_LIST_START', this.handleProcessTorrentListStart);
      clientGatewayService.on('PROCESS_TORRENT_LIST_END', this.handleProcessTorrentListEnd);
      clientGatewayService.on('PROCESS_TORRENT', this.handleProcessTorrent);
    };
  }

  destroy() {
    if (this.services == null || this.services.clientGatewayService == null) {
      return;
    }

    const {clientGatewayService} = this.services;

    clientGatewayService.removeListener('PROCESS_TORRENT_LIST_START', this.handleProcessTorrentListStart);
    clientGatewayService.removeListener('PROCESS_TORRENT_LIST_END', this.handleProcessTorrentListEnd);
    clientGatewayService.removeListener('PROCESS_TORRENT', this.handleProcessTorrent);
  }

  getTaxonomy() {
    return {
      id: Date.now(),
      taxonomy: this.taxonomy,
    };
  }

  handleProcessTorrentListStart() {
    this.lastTaxonomy = {
      statusCounts: {...this.taxonomy.statusCounts},
      tagCounts: {...this.taxonomy.tagCounts},
      trackerCounts: {...this.taxonomy.trackerCounts},
    };

    torrentStatusMap.forEach((status) => {
      this.taxonomy.statusCounts[status] = 0;
    });

    this.taxonomy.statusCounts.all = 0;
    this.taxonomy.tagCounts = {all: 0, untagged: 0};
    this.taxonomy.trackerCounts = {all: 0};
  }

  handleProcessTorrentListEnd({torrents}: {torrents: Torrents}) {
    const {length} = Object.keys(torrents);

    this.taxonomy.statusCounts.all = length;
    this.taxonomy.tagCounts.all = length;
    this.taxonomy.trackerCounts.all = length;

    let didDiffChange = false;
    const taxonomyDiffs = Object.keys(this.taxonomy).reduce((accumulator, key) => {
      const countType = key as keyof Taxonomy;
      const countDiff = objectUtil.getDiff(this.lastTaxonomy[countType], this.taxonomy[countType]);

      if (countDiff.length > 0) {
        didDiffChange = true;
      }

      return Object.assign(accumulator, {
        [countType]: countDiff,
      });
    }, {} as TaxonomyDiffs);

    if (didDiffChange) {
      this.emit('TAXONOMY_DIFF_CHANGE', {
        diff: taxonomyDiffs,
        id: Date.now(),
      });
    }
  }

  handleProcessTorrent(torrentProperties: TorrentProperties) {
    this.incrementStatusCounts(torrentProperties.status);
    this.incrementTagCounts(torrentProperties.tags);
    this.incrementTrackerCounts(torrentProperties.trackerURIs);
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

  incrementTrackerCounts(trackers: TorrentProperties['trackerURIs']) {
    trackers.forEach((tracker) => {
      if (this.taxonomy.trackerCounts[tracker] != null) {
        this.taxonomy.trackerCounts[tracker] += 1;
      } else {
        this.taxonomy.trackerCounts[tracker] = 1;
      }
    });
  }
}

export default TaxonomyService;
