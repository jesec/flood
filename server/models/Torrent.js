'use strict';

let _ = require('lodash');

let regEx = require('../../shared/util/regEx');
let stringUtil = require('../../shared/util/stringUtil');

const CALCULATED_DATA = [
  'eta',
  'percentComplete',
  'status',
  'trackers',
  'totalPeers',
  'totalSeeds'
];

const REQUESTED_DATA = [
  // Torrent List data
  'hash',
  'added',
  'bytesDone',
  'downloadRate',
  'downloadTotal',
  'eta',
  'name',
  'percentComplete',
  'ratio',
  'sizeBytes',
  'status',
  'totalPeers',
  'totalSeeds',
  'uploadTotal',
  'uploadRate',
  'priority',
  'trackers',

  // Torrent Details data
  'creationDate',
  'freeDiskSpace',
  'connectedPeers',
  'connectedSeeds',
  'message',
  'basePath',
  'ignoreScheduler',
  'comment',
  'isPrivate',
  'directory',
  'filename',
  'isMultiFile'
];

class Torrent {
  constructor(clientData, opts) {
    if (!clientData) {
      return;
    }

    opts = opts || {};
    this._lastUpdated = opts.currentTime || Date.now();
    this._torrentData = this.getCalculatedClientData(clientData, opts);
  }

  get data() {
    // TODO: Only return the properties that are different than the last time
    // get was called. Perhaps identify the last time it was called by ID so
    // different consumers can use it. And/or allow users to get everything.
    return Object.assign({}, this._torrentData);
  }

  get status() {
    return this._torrentData.status || [];
  }

  get trackers() {
    return this._torrentData.trackers || [];
  }

  getCalculatedClientData(clientData, opts) {
    let keysToProcess = CALCULATED_DATA;
    let requestedData = REQUESTED_DATA;

    let torrentData = {};

    if (opts.requestedData && _.isArray(opts.requestedData)) {
      keysToProcess = opts.requestedData;
    } else if (opts.requestedData) {
      console.warn('Torrent: requestedData mut be an array, using defaults.');
    }

    keysToProcess = keysToProcess.concat(requestedData);

    keysToProcess.forEach((key) => {
      let getCalculatedFnName = `getCalculated${stringUtil.capitalize(key)}`;

      if (typeof this[getCalculatedFnName] === 'function') {
        torrentData[key] = this[getCalculatedFnName](clientData);
      } else {
        torrentData[key] = clientData[key];
      }
    });

    return torrentData;
  }

  getPeerCount(string) {
    var markerPosition = string.indexOf('@!@');
    return string.substr(0, markerPosition);
  }

  getCalculatedEta(clientData) {
    let rate = clientData.downloadRate;
    let completed = clientData.bytesDone;
    let total = clientData.sizeBytes;

    if (rate > 0) {
      let cumSeconds = (total - completed) / rate;

      let years = Math.floor(cumSeconds / 31536000);
      let weeks = Math.floor((cumSeconds % 31536000) / 604800);
      let days = Math.floor(((cumSeconds % 31536000) % 604800) / 86400);
      let hours = Math.floor((((cumSeconds % 31536000) % 604800) % 86400) / 3600);
      let minutes = Math.floor(((((cumSeconds % 31536000) % 604800) % 86400) % 3600) / 60);
      let seconds = Math.floor(cumSeconds - (minutes * 60));

      let timeRemaining = {};

      if (years > 0) {
        timeRemaining = {years, weeks, cumSeconds};
      } else if (weeks > 0) {
        timeRemaining = {weeks, days, cumSeconds};
      } else if (days > 0) {
        timeRemaining = {days, hours, cumSeconds};
      } else if (hours > 0) {
        timeRemaining = {hours, minutes, cumSeconds};
      } else if (minutes > 0) {
        timeRemaining = {minutes, seconds, cumSeconds};
      } else {
        timeRemaining = {cumSeconds};
      }

      return timeRemaining;
    } else {
      return 'Infinity';
    }
  }

  getCalculatedPercentComplete(clientData) {
    return (clientData.bytesDone / clientData.sizeBytes * 100).toFixed(2);
  }

  getCalculatedStatus(clientData) {
    let isHashChecking = clientData.isHashChecking;
    let isComplete = clientData.isComplete;
    let isOpen = clientData.isOpen;
    let uploadRate = clientData.uploadRate;
    let downloadRate = clientData.downloadRate;
    let state = clientData.state;
    let message = clientData.message;

    let torrentStatus = [];

    if (isHashChecking === '1') {
      torrentStatus.push('ch'); // checking
    } else if (isComplete === '1' && isOpen === '1' && state === '1') {
      torrentStatus.push('sd'); // seeding
  	} else if (isComplete === '1' && isOpen === '1' && state === '0') {
      torrentStatus.push('p'); // paused
  	} else if (isComplete === '1' && isOpen === '0') {
      torrentStatus.push('s'); // stopped
      torrentStatus.push('c'); // complete
  	} else if (isComplete === '0' && isOpen === '1' && state === '1') {
      torrentStatus.push('d'); // downloading
  	} else if (isComplete === '0' && isOpen === '1' && state === '0') {
      torrentStatus.push('p'); // paused
  	} else if (isComplete === '0' && isOpen === '0') {
      torrentStatus.push('s'); // stopped
  	}

    if (message.length) {
      torrentStatus.push('e'); // error
    }

    if (uploadRate === '0' && downloadRate === '0') {
      torrentStatus.push('i');
    } else {
      torrentStatus.push('a');
    }

    return torrentStatus;
  }

  getCalculatedTotalPeers(clientData) {
    return this.getPeerCount(clientData.totalPeers);
  }

  getCalculatedTotalSeeds(clientData) {
    return this.getPeerCount(clientData.totalSeeds);
  }

  getCalculatedTrackers(clientData) {
    let trackers = clientData.trackers.split('@!@');
    let trackerDomains = [];

    trackers.forEach(function (tracker) {
      let domain = regEx.domainName.exec(tracker);

      if (domain && domain[1]) {
        domain = domain[1];

        let domainSubsets = domain.split('.');
        let desiredSubsets = 2;
        let subsetMinLength = 3;

        if (domainSubsets.length > desiredSubsets) {
          let lastDesiredSubset = domainSubsets[domainSubsets.length - desiredSubsets];
          if (lastDesiredSubset.length <= 3) {
            desiredSubsets++;
          }
        }

        domain = domainSubsets.slice(desiredSubsets * -1).join('.');

        trackerDomains.push(domain);
      }
    });

    return trackerDomains;
  }

  updateData(clientData, opts) {
    // TODO somehow communicate that only some props were updated
    this._lastUpdated = opts.currentTime || Date.now();
    this._torrentData = this.getCalculatedClientData(clientData, opts);
  }
}

module.exports = Torrent;
