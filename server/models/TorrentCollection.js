'use strict';

let _ = require('lodash');

let clientUtil = require('../util/clientUtil');
let propsMap = require('../../shared/constants/propsMap');
let stringUtil = require('../../shared/util/stringUtil');
let Torrent = require('./Torrent');

class TorrentCollection {
  constructor() {
    this._removedHashes = [];
    this._statusCount = {all: 0};
    this._torrents = {};
    this._torrentData = {};
    this._trackerCount = {all: 0};
  }

  get statusCount() {
    return Object.assign({}, this._statusCount);
  }

  get torrents() {
    let currentTorrents = {};

    Object.keys(this._torrents).forEach((hash) => {
      currentTorrents[hash] = this._torrents[hash].data;
    });

    return currentTorrents;
  }

  get trackerCount() {
    return Object.assign({}, this._trackerCount);
  }

  incrementTrackerCount(trackers) {
    trackers.forEach((tracker) => {
      if (typeof this._trackerCount[tracker] === 'number') {
        this._trackerCount[tracker]++;
      } else {
        this._trackerCount[tracker] = 1;
      }
    });
  }

  incrementStatusCount(statusData) {
    statusData.forEach((status) => {
      this._statusCount[propsMap.serverStatus[status]]++;
    });
  }

  removeOutdatedTorrents(newHashes) {
    let currentHashes = Object.keys(this._torrents);
    let removedHashes = _.difference(currentHashes, newHashes);

    console.log(`removing ${removedHashes.length} hashes`);

    removedHashes.forEach((hash) => {
      delete this._torrents[hash];
    });
  }

  resetStatusCount() {
    Object.keys(propsMap.serverStatus).forEach((key) => {
      this._statusCount[propsMap.serverStatus[key]] = 0;
    });
  }

  resetTrackerCount() {
    this._trackerCount = {all: 0};
  }

  updateTorrents(clientData) {
    let currentTime = Date.now();
    let knownHashes = [];
    let torrentData = clientUtil.mapClientProps(
      clientUtil.defaults.torrentProperties, clientData
    );

    this.resetStatusCount();
    this.resetTrackerCount();

    // Create Torrent instances with additonal calculated properties.
    torrentData.forEach((torrent, index) => {
      let hash = torrent.hash;
      knownHashes.push(hash);

      // If we already know about the torrent, then just update its data. Create
      // new torrent otherwise.
      if (this._torrents[hash]) {
        this._torrents[hash].updateData(torrent, {currentTime: currentTime});
      } else {
        this._torrents[hash] = new Torrent(torrent, {currentTime: currentTime});
      }

      // Update the status count with this torrent's status.
      this.incrementStatusCount(this._torrents[hash].status);
      this.incrementTrackerCount(this._torrents[hash].trackers);
    });

    this.removeOutdatedTorrents(knownHashes);

    this._statusCount.all = torrentData.length || 0;
    this._trackerCount.all = torrentData.length || 0;
  }
}

module.exports = TorrentCollection;
