import jsonpatch, {Operation} from 'fast-json-patch';

import BaseService from './BaseService';
import torrentStatusMap from '../../shared/constants/torrentStatusMap';

import type {Taxonomy} from '../../shared/types/Taxonomy';
import type {TorrentStatus} from '../../shared/constants/torrentStatusMap';
import type {TorrentProperties, TorrentList} from '../../shared/types/Torrent';

interface TaxonomyServiceEvents {
  TAXONOMY_DIFF_CHANGE: (payload: {id: number; diff: Operation[]}) => void;
}

class TaxonomyService extends BaseService<TaxonomyServiceEvents> {
  taxonomy: Taxonomy = {
    statusCounts: {'': 0},
    tagCounts: {'': 0, untagged: 0},
    trackerCounts: {'': 0},
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

  destroy() {
    if (this.services?.clientGatewayService == null) {
      return;
    }

    const {clientGatewayService} = this.services;

    clientGatewayService.removeListener('PROCESS_TORRENT_LIST_START', this.handleProcessTorrentListStart);
    clientGatewayService.removeListener('PROCESS_TORRENT_LIST_END', this.handleProcessTorrentListEnd);
    clientGatewayService.removeListener('PROCESS_TORRENT', this.handleProcessTorrent);

    super.destroy();
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
      trackerCounts: {...this.taxonomy.trackerCounts},
    };

    torrentStatusMap.forEach((status) => {
      this.taxonomy.statusCounts[status] = 0;
    });

    this.taxonomy.statusCounts[''] = 0;
    this.taxonomy.tagCounts = {'': 0, untagged: 0};
    this.taxonomy.trackerCounts = {'': 0};
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
    this.incrementTrackerCounts(torrentProperties.trackerURIs);
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
