const EventEmitter = require('events');

const BaseService = require('./BaseService');
const clientGatewayServiceEvents = require('../constants/clientGatewayServiceEvents');
const objectUtil = require('../../shared/util/objectUtil');
const taxonomyServiceEvents = require('../constants/taxonomyServiceEvents');
const torrentStatusMap = require('../../shared/constants/torrentStatusMap');

class TaxonomyService extends BaseService {
  constructor() {
    super(...arguments);

    this.lastStatusCounts = {all: 0};
    this.lastTagCounts = {all: 0};
    this.lastTrackerCounts = {all: 0};

    this.statusCounts = {all: 0};
    this.tagCounts = {all: 0};
    this.trackerCounts = {all: 0};

    this.handleProcessTorrent = this.handleProcessTorrent.bind(this);
    this.handleProcessTorrentListStart = this.handleProcessTorrentListStart.bind(this);
    this.handleProcessTorrentListEnd = this.handleProcessTorrentListEnd.bind(this);

    const clientGatewayService = this.services.clientGatewayService;

    clientGatewayService.on(
      clientGatewayServiceEvents.PROCESS_TORRENT_LIST_START,
      this.handleProcessTorrentListStart
    );

    clientGatewayService.on(
      clientGatewayServiceEvents.PROCESS_TORRENT_LIST_END,
      this.handleProcessTorrentListEnd
    );

    clientGatewayService.on(
      clientGatewayServiceEvents.PROCESS_TORRENT,
      this.handleProcessTorrent
    );
  }

  destroy() {
    const clientGatewayService = this.services.clientGatewayService;

    clientGatewayService.removeListener(
      clientGatewayServiceEvents.PROCESS_TORRENT_LIST_START,
      this.handleProcessTorrentListStart
    );

    clientGatewayService.removeListener(
      clientGatewayServiceEvents.PROCESS_TORRENT_LIST_END,
      this.handleProcessTorrentListEnd
    );

    clientGatewayService.removeListener(
      clientGatewayServiceEvents.PROCESS_TORRENT,
      this.handleProcessTorrent
    );
  }

  destroy() {
    const clientGatewayService = this.services.clientGatewayService;

    clientGatewayService.removeListener(
      clientGatewayServiceEvents.PROCESS_TORRENT_LIST_START,
      this.handleProcessTorrentListStart
    );

    clientGatewayService.removeListener(
      clientGatewayServiceEvents.PROCESS_TORRENT_LIST_END,
      this.handleProcessTorrentListEnd
    );

    clientGatewayService.removeListener(
      clientGatewayServiceEvents.PROCESS_TORRENT,
      this.handleProcessTorrent
    );
  }

  getTaxonomy() {
    return {
      id: Date.now(),
      taxonomy: {
        statusCounts: this.statusCounts,
        tagCounts: this.tagCounts,
        trackerCounts: this.trackerCounts
      }
    };
  }

  handleProcessTorrentListStart() {
    this.lastStatusCounts = Object.assign({}, this.statusCounts);
    this.lastTagCounts = Object.assign({}, this.tagCounts);
    this.lastTrackerCounts = Object.assign({}, this.trackerCounts);

    torrentStatusMap.statusShorthand.forEach(statusShorthand => {
      this.statusCounts[torrentStatusMap[statusShorthand]] = 0;
    });

    this.statusCounts.all = 0;
    this.tagCounts = {all: 0};
    this.trackerCounts = {all: 0};
  }

  handleProcessTorrentListEnd(torrentList) {
    const {length = 0} = torrentList;

    this.statusCounts.all = length;
    this.tagCounts.all = length;
    this.trackerCounts.all = length;

    const taxonomyDiffs = {
      statusCounts: objectUtil.getDiff(
        this.lastStatusCounts,
        this.statusCounts
      ),
      tagCounts: objectUtil.getDiff(
        this.lastTagCounts,
        this.tagCounts
      ),
      trackerCounts: objectUtil.getDiff(
        this.lastTrackerCounts,
        this.trackerCounts
      )
    };

    const didDiffChange = Object.keys(taxonomyDiffs).some(diffKey => {
      return taxonomyDiffs[diffKey].length > 0;
    });

    if (didDiffChange) {
      this.emit(
        taxonomyServiceEvents.TAXONOMY_DIFF_CHANGE,
        {
          diff: taxonomyDiffs,
          id: Date.now()
        }
      );
    }
  }

  handleProcessTorrent(torrentDetails) {
    this.incrementStatusCounts(torrentDetails.status);
    this.incrementTagCounts(torrentDetails.tags);
    this.incrementTrackerCounts(torrentDetails.trackerURIs);
  }

  incrementStatusCounts(statuses) {
    statuses.forEach(status => {
      this.statusCounts[torrentStatusMap[status]]++;
    });
  }

  incrementTagCounts(tags) {
    if (tags.length === 0) {
      tags = ['untagged'];
    }

    tags.forEach(tag => {
      if (this.tagCounts[tag] != null) {
        this.tagCounts[tag]++;
      } else {
        this.tagCounts[tag] = 1;
      }
    });
  }

  incrementTrackerCounts(trackers) {
    trackers.forEach(tracker => {
      if (this.trackerCounts[tracker] != null) {
        this.trackerCounts[tracker]++;
      } else {
        this.trackerCounts[tracker] = 1;
      }
    });
  }
}

module.exports = TaxonomyService;
