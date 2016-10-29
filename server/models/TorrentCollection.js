'use strict';

let _ = require('lodash');

let clientUtil = require('../util/clientUtil');
let torrentStatusMap = require('../../shared/constants/torrentStatusMap');
let stringUtil = require('../../shared/util/stringUtil');
let Torrent = require('./Torrent');

const DEFAULT_TAG = 'untagged';

class TorrentCollection {
  constructor() {
    this.tagCount = {all: 0};
    this.statusCount = {all: 0};
    this.torrents = {};
    this.trackerCount = {all: 0};
  }

  getTorrents() {
    let currentTorrents = {};

    Object.keys(this.torrents).forEach((hash) => {
      currentTorrents[hash] = this.torrents[hash].data;
    });

    return currentTorrents;
  }

  getStatusCount() {
    return Object.assign({}, this.statusCount);
  }

  setStatusCount(statusData) {
    statusData.forEach((status) => {
      this.statusCount[torrentStatusMap[status]]++;
    });
  }

  getTagCount() {
    return Object.assign({}, this.tagCount);
  }

  setTagCount(tags) {
    if (tags.length === 0) {
      tags = [DEFAULT_TAG];
    }

    tags.forEach((tag) => {
      if (this.tagCount[tag] != null) {
        this.tagCount[tag]++;
      } else {
        this.tagCount[tag] = 1;
      }
    });
  }

  getTrackerCount() {
    return Object.assign({}, this.trackerCount);
  }

  setTrackerCount(trackers) {
    trackers.forEach((tracker) => {
      if (this.trackerCount[tracker] != null) {
        this.trackerCount[tracker]++;
      } else {
        this.trackerCount[tracker] = 1;
      }
    });
  }

  removeOutdatedTorrents(newHashes) {
    let currentHashes = Object.keys(this.torrents);
    let removedHashes = _.difference(currentHashes, newHashes);

    removedHashes.forEach((hash) => {
      delete this.torrents[hash];
    });
  }

  resetStatusCount() {
    torrentStatusMap.statusShorthand.forEach((shorthand) => {
      this.statusCount[torrentStatusMap[shorthand]] = 0;
    });
  }

  resetTagCount() {
    this.tagCount = {all: 0};
  }

  resetTrackerCount() {
    this.trackerCount = {all: 0};
  }

  updateTorrents(clientData) {
    let currentTime = Date.now();
    let knownHashes = [];
    let torrentData = clientUtil.mapClientResponse(
      clientUtil.defaults.torrentProperties, clientData
    );

    this.resetStatusCount();
    this.resetTagCount();
    this.resetTrackerCount();

    // Create Torrent instances with additonal calculated properties.
    torrentData.forEach((torrent, index) => {
      let hash = torrent.hash;
      knownHashes.push(hash);

      // If we already know about the torrent, then just update its data. Create
      // new torrent otherwise.
      if (this.torrents[hash]) {
        this.torrents[hash].updateData(torrent, {currentTime: currentTime});
      } else {
        this.torrents[hash] = new Torrent(torrent, {currentTime: currentTime});
      }

      // Update the status count with this torrent's status.
      this.setStatusCount(this.torrents[hash].status);
      this.setTagCount(this.torrents[hash].tags);
      this.setTrackerCount(this.torrents[hash].trackers);
    });

    this.removeOutdatedTorrents(knownHashes);

    this.statusCount.all = torrentData.length || 0;
    this.tagCount.all = torrentData.length || 0;
    this.trackerCount.all = torrentData.length || 0;
  }
}

module.exports = TorrentCollection;
