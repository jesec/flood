'use strict';

let fs = require('fs');
let util = require('util');

let clientResponseUtil = require('../util/clientResponseUtil');
let clientSettingsMap = require('../../shared/constants/clientSettingsMap');
let ClientRequest = require('./ClientRequest');
let clientUtil = require('../util/clientUtil');
let propsMap = require('../../shared/constants/propsMap');
let formatUtil = require('../util/formatUtil');
let scgi = require('../util/scgi');
let Torrent = require('./Torrent');
let TorrentCollection = require('./TorrentCollection');

let _statusCount = {};
let _torrentCollection = new TorrentCollection();
let _trackerCount = {};

var client = {
  addFiles: (req, callback) => {
    let files = req.files;
    let path = req.body.destination;
    let request = new ClientRequest();

    request.add('createDirectory', {path});
    request.send();

    // Each torrent is sent individually because rTorrent accepts a total
    // filesize of 524 kilobytes or less. This allows the user to send many
    // torrent files reliably.
    files.forEach((file, index) => {
      let fileRequest = new ClientRequest();
      fileRequest.add('addFiles', {files: file, path});

      // Set the callback for only the last request.
      if (index === files.length - 1) {
        fileRequest.onComplete(callback);
      }

      fileRequest.send();
    });
  },

  addUrls: (data, callback) => {
    let urls = data.urls;
    let path = data.destination;
    let start = data.start;
    let request = new ClientRequest();

    request.add('createDirectory', {path});
    request.add('addURLs', {urls, path, start});
    request.onComplete(callback);
    request.send();
  },

  checkHash: (hashes, callback) => {
    let request = new ClientRequest();

    request.add('checkHash', {hashes});
    request.onComplete(callback);
    request.send();
  },

  deleteTorrents: (hashes, callback) => {
    let request = new ClientRequest();

    request.add('removeTorrents', {hashes});
    request.onComplete(callback);
    request.send();
  },

  getSettings: (options, callback) => {
    let requestedSettingsKeys = [];
    let request = new ClientRequest();
    let response = {};

    let outboundTransformation = {
      throttleGlobalDownMax: (apiResponse) => {
        return Number(apiResponse) / 1024;
      },
      throttleGlobalUpMax: (apiResponse) => {
        return Number(apiResponse) / 1024;
      },
      piecesMemoryMax: (apiResponse) => {
        return Number(apiResponse) / (1024 * 1024);
      }
    };

    request.add('fetchSettings', {
      options,
      setRequestedKeysArr: (requestedSettingsKeysArr) => {
        requestedSettingsKeys = requestedSettingsKeysArr;
      }
    });

    request.postProcess((data) => {
      if (!data) {
        return null;
      }

      data.forEach((datum, index) => {
        let value = datum[0];
        let settingsKey = clientSettingsMap[requestedSettingsKeys[index]];

        if (!!outboundTransformation[settingsKey]) {
          value = outboundTransformation[settingsKey](value);
        }

        response[settingsKey] = value;
      });

      return response;
    });
    request.onComplete(callback);
    request.send();
  },

  getTorrentStatusCount: (callback) => {
    callback(_statusCount);
  },

  getTorrentTrackerCount: (callback) => {
    callback(_trackerCount);
  },

  getTorrentDetails: (hash, callback) => {
    let request = new ClientRequest();

    request.add('getTorrentDetails', {
      hash,
      fileProps: clientUtil.defaults.filePropertyMethods,
      peerProps: clientUtil.defaults.peerPropertyMethods,
      trackerProps: clientUtil.defaults.trackerPropertyMethods
    });
    request.postProcess(clientResponseUtil.processTorrentDetails);
    request.onComplete(callback);
    request.send();
  },

  getTorrentList: (callback) => {
    let request = new ClientRequest();

    request.add('getTorrentList',
      {props: clientUtil.defaults.torrentPropertyMethods});
    request.postProcess((data) => {
      if (!data || data[0][0].length === 0) {
        return null;
      }

      // TODO: Remove this nasty nested array business.
      _torrentCollection.updateTorrents(data[0][0]);
      _statusCount = _torrentCollection.statusCount;
      _trackerCount = _torrentCollection.trackerCount;

      return _torrentCollection.torrents;
    });
    request.onComplete(callback);
    request.send();
  },

  listMethods: (method, args, callback) => {
    let request = new ClientRequest();

    request.add('listMethods', {method, args});
    request.onComplete(callback);
    request.send();
  },

  moveTorrents: (data, callback) => {
    let destinationPath = data.destination;
    let hashes = data.hashes;
    let filenames = data.filenames;
    let moveFiles = data.moveFiles;
    let sourcePaths = data.sources;
    let mainRequest = new ClientRequest();

    let startTorrents = () => {
      let startTorrentsRequest = new ClientRequest();
      startTorrentsRequest.add('startTorrents', {hashes});
      startTorrentsRequest.onComplete(callback);
      startTorrentsRequest.send();
    };

    let checkHash = () => {
      let checkHashRequest = new ClientRequest();
      checkHashRequest.add('checkHash', {hashes});
      checkHashRequest.onComplete(afterCheckHash);
      checkHashRequest.send();
    }

    let moveTorrents = () => {
      let moveTorrentsRequest = new ClientRequest();
      moveTorrentsRequest.onComplete(checkHash);
      moveTorrentsRequest.add('moveTorrents',
        {filenames, sourcePaths, destinationPath});
    };

    let afterCheckHash = startTorrents;
    let afterSetPath = checkHash;

    if (moveFiles) {
      afterSetPath = moveTorrents;
    }

    mainRequest.add('stopTorrents', {hashes});
    mainRequest.add('setDownloadPath', {hashes, path: destinationPath});
    mainRequest.onComplete(afterSetPath);
    mainRequest.send();
  },

  setFilePriority: (hashes, data, callback) => {
    // TODO Add support for multiple hashes.
    let fileIndex = data.fileIndices[0];
    let request = new ClientRequest();

    request.add('setFilePriority', {hashes, fileIndex, priority: data.priority});
    request.onComplete(callback);
    request.send();
  },

  setPriority: (hashes, data, callback) => {
    let request = new ClientRequest();

    request.add('setPriority', {hashes, priority: data.priority});
    request.onComplete(callback);
    request.send();
  },

  setSettings: (payloads, callback) => {
    let request = new ClientRequest();

    if (payloads.length === 0) {
      callback({});
      return;
    }

    let inboundTransformation = {
      throttleGlobalDownMax: (userInput) => {
        return {
          id: userInput.id,
          data: Number(userInput.data) * 1024
        };
      },
      throttleGlobalUpMax: (userInput) => {
        return {
          id: userInput.id,
          data: Number(userInput.data) * 1024
        };
      },
      piecesMemoryMax: (userInput) => {
        return {
          id: userInput.id,
          data: Number(userInput.data) * 1024 * 1024
        };
      }
    };

    let transformedPayloads = payloads.map((payload) => {
      if (!!inboundTransformation[payload.id]) {
        return inboundTransformation[payload.id](payload);
      }

      return payload;
    });

    request.add('setSettings', {settings: transformedPayloads});
    request.onComplete(callback);
    request.send();
  },

  setSpeedLimits: (data, callback) => {
    let request = new ClientRequest();

    request.add('setThrottle',
      {direction: data.direction, throttle: data.throttle});
    request.onComplete(callback);
    request.send();
  },

  stopTorrent: (hashes, callback) => {
    let request = new ClientRequest();

    request.add('stopTorrents', {hashes});
    request.onComplete(callback);
    request.send();
  },

  startTorrent: (hashes, callback) => {
    let request = new ClientRequest();

    request.add('startTorrents', {hashes});
    request.onComplete(callback);
    request.send();
  },

  getTransferStats: (callback) => {
    let request = new ClientRequest();

    request.add('getTransferData');
    request.postProcess(clientResponseUtil.processTransferStats);
    request.onComplete(callback);
    request.send();
  }
};

module.exports = client;
