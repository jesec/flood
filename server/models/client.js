'use strict';

let fs = require('fs');
let util = require('util');

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
  addUrls: function(data, callback) {
    var multicall = [
      []
    ];

    if (data.destination !== null && data.destination !== '') {
      multicall[0].push({
        methodName: 'execute',
        params: [
          'mkdir',
          '-p',
          data.destination
        ]
      });
    }

    var torrentsAdded = 0;

    while (torrentsAdded < data.urls.length) {
      var parameters = [
        '',
        data.urls[torrentsAdded]
      ];

      if (data.destination !== null && data.destination !== '') {
        parameters.push('d.directory.set="' + data.destination + '"');
      }

      parameters.push('d.custom.set=addtime,' + Math.floor(Date.now() / 1000));

      multicall[0].push({
        methodName: 'load.start',
        params: parameters
      });

      torrentsAdded++;
    }

    scgi.methodCall('system.multicall', multicall).then(function(data) {
      callback(null, data);
    }, function(error) {
      callback(error, null);
    });
  },

  addFiles: function(req, callback) {
    let torrentDestination = req.body.destination;
    let uploadedTorrents = req.files;

    let torrentsAdded = 0;

    while (torrentsAdded < uploadedTorrents.length) {
      let file = uploadedTorrents[torrentsAdded];
      let filename = file.filename;
      let fileContents = file.buffer;
      let multicall = [
        []
      ];

      if (torrentDestination !== null && torrentDestination !== '') {
        multicall[0].push({
          methodName: 'execute',
          params: [
            'mkdir',
            '-p',
            torrentDestination
          ]
        });
      }

      var parameters = [
        '',
        fileContents
      ];

      if (torrentDestination !== null && torrentDestination !== '') {
        parameters.push('d.directory.set="' + torrentDestination + '"');
      }

      parameters.push('d.custom.set=x-filename,' + filename);

      parameters.push('d.custom.set=addtime,' + Math.floor(Date.now() / 1000));

      multicall[0].push({
        methodName: 'load.raw_start',
        params: parameters
      });

      torrentsAdded++;

      scgi.methodCall('system.multicall', multicall).then(function(data) {
        console.log(data);
        callback(null, data);
      }, function(error) {
        callback(error, null);
      });
    }
  },

  deleteTorrents: function(hash, callback) {
    if (!util.isArray(hash)) {
      hash = [hash];
    } else {
      hash = String(hash).split(',');
    }

    for (i = 0, len = hash.length; i < len; i++) {
      scgi.methodCall('d.erase', [hash[i]]).then(function(data) {
        callback(null, data);
      }, function(error) {
        callback(error, null);
      });
    }
  },

  getTorrentStatusCount: function(callback) {
    callback(null, _statusCount);
  },

  getTorrentTrackerCount: function(callback) {
    callback(null, _trackerCount);
  },

  getTorrentDetails: function(hash, callback) {
    var peerParams = [hash, ''].concat(clientUtil.defaults.peerPropertyMethods);
    var fileParams = [hash, ''].concat(clientUtil.defaults.filePropertyMethods);
    var trackerParams = [hash, ''].concat(clientUtil.defaults.trackerPropertyMethods);

    var multicall = [
      []
    ];

    multicall[0].push({
      methodName: 'p.multicall',
      params: peerParams
    });

    multicall[0].push({
      methodName: 'f.multicall',
      params: fileParams
    });

    multicall[0].push({
      methodName: 't.multicall',
      params: trackerParams
    });

    scgi.methodCall('system.multicall', multicall)
      .then(function(data) {
        // This is ugly, but it handles several types of responses from the
        // client.
        var peersData = data[0][0] || null;
        var filesData = data[1][0] || null;
        var trackerData = data[2][0] || null;
        var peers = null;
        var files = null;
        var trackers = null;

        if (peersData && peersData.length) {
          peers = clientUtil.mapClientProps(
            clientUtil.defaults.peerProperties,
            peersData
          );
        }

        if (filesData && filesData.length) {
          files = clientUtil.mapClientProps(
            clientUtil.defaults.fileProperties,
            filesData
          );

          files = files.map(function (file) {
            file.filename = file.pathComponents[file.pathComponents.length - 1];
            file.percentComplete = (file.completedChunks / file.sizeChunks * 100).toFixed(0);
            delete(file.completedChunks);
            delete(file.sizeChunks);
            return file;
          });
        }

        if (trackerData && trackerData.length) {
          trackers = clientUtil.mapClientProps(
            clientUtil.defaults.trackerProperties,
            trackerData
          );
        }

        callback(null, {
          peers: peers,
          files: files,
          trackers: trackers
        });
      }, function(error) {
        callback(error, null);
      });
  },

  getTorrentList: function(callback) {
    scgi.methodCall('d.multicall2', clientUtil.defaults.torrentPropertyMethods)
      .then(function(data) {
        try {
          _torrentCollection.updateTorrents(data);
          _statusCount = _torrentCollection.statusCount;
          _trackerCount = _torrentCollection.trackerCount;
        } catch (err) {
          console.log(err);
        }
        callback(null, _torrentCollection.torrents);
      }, function(error) {
        callback(error, null)
      });
  },

  listMethods: function(method, args, callback) {
    if (args) {
      args = [args];
    }
    scgi.methodCall(method, args).then(function(data) {
      callback(null, data);
    }, function(error) {
      callback(error, null);
    });
  },

  moveFiles: function(data, callback) {
    let files = data.files || [];

    var multicall = [
      []
    ];

    if (data.destination !== null && data.destination !== '') {
      multicall[0].push({
        methodName: 'execute',
        params: [
          'mkdir',
          '-p',
          data.destination
        ]
      });
    }

    var torrentsAdded = 0;

    // loop through the torrents:
    //  stop torrents, call d.stop and d.close
    //  move torrents
    //  set new torrent directory
    //  start torrents, call d.start and d.open

    while (torrentsAdded < data.urls.length) {
      var parameters = [
        '',
        data.urls[torrentsAdded]
      ];

      if (data.destination !== null && data.destination !== '') {
        parameters.push('d.directory.set="' + data.destination + '"');
      }

      parameters.push('d.custom.set=addtime,' + Math.floor(Date.now() / 1000));

      multicall[0].push({
        methodName: 'load.start',
        params: parameters
      });

      torrentsAdded++;
    }

    scgi.methodCall('system.multicall', multicall).then(function(data) {
      callback(null, data);
    }, function(error) {
      callback(error, null);
    });
  },

  setFilePriority: function (hash, data, callback) {
    // TODO Add support for multiple hashes.
    var fileIndex = data.fileIndices[0];

    var multicall = [
      [
        {
          methodName: 'f.priority.set',
          params: [
            hash + ':f' + fileIndex,
            data.priority
          ]
        },
        {
          methodName: 'd.update_priorities',
          params: [
            hash
          ]
        }
      ]
    ];

    scgi.methodCall('system.multicall', multicall)
      .then(function(data) {
        callback(null, data);
      }, function(error) {
        callback(error, null);
      });
  },

  setPriority: function (hash, data, callback) {
    // TODO Add support for multiple hashes.
    var multicall = [
      [
        {
          methodName: 'd.set_priority',
          params: [
            hash,
            data.priority
          ]
        },
        {
          methodName: 'd.update_priorities',
          params: [
            hash
          ]
        }
      ]
    ];

    scgi.methodCall('system.multicall', multicall)
      .then(function(data) {
        callback(null, data);
      }, function(error) {
        callback(error, null);
      });
  },

  setSpeedLimits: function(data, callback) {
    var methodName = 'throttle.global_down.max_rate.set';

    if (data.direction === 'upload') {
      methodName = 'throttle.global_up.max_rate.set';
    }

    var multicall = [
      [
        {
          methodName: methodName,
          params: [
            '',
            data.throttle
          ]
        }
      ]
    ];

    scgi.methodCall('system.multicall', multicall)
      .then(function(data) {
        callback(null, data);
      }, function(error) {
        callback(error, null);
      });
  },

  stopTorrent: function(hashes, callback) {
    if (!util.isArray(hashes)) {
      hashes = [hashes];
    } else {
      hashes = String(hashes).split(',');
    }

    var multicall = [
      []
    ];

    hashes.forEach(function (hash) {
      multicall[0].push({
        methodName: 'd.stop',
        params: [hash]
      });
      multicall[0].push({
        methodName: 'd.close',
        params: [hash]
      });
    });

    scgi.methodCall('system.multicall', multicall)
    .then(function(data) {
      callback(null, data);
    }, function(error) {
      callback(error, null);
    });
  },

  startTorrent: function(hashes, callback) {
    if (!util.isArray(hashes)) {
      hashes = [hashes];
    } else {
      hashes = String(hashes).split(',');
    }

    var multicall = [
      []
    ];

    hashes.forEach(function (hash) {
      multicall[0].push({
        methodName: 'd.open',
        params: [hash]
      });
      multicall[0].push({
        methodName: 'd.start',
        params: [hash]
      });
    });

    scgi.methodCall('system.multicall', multicall)
    .then(function(data) {
      callback(null, data);
    }, function(error) {
      callback(error, null);
    });
  },

  getTransferStats: function(callback) {
    var request = clientUtil.createMulticallRequest(
      clientUtil.defaults.clientPropertyMethods
    );

    request = [request];

    scgi.methodCall('system.multicall', request)
      .then(function(data) {
        var parsedData = clientUtil.mapClientProps(
          clientUtil.defaults.clientProperties,
          data
        );
        callback(null, parsedData);
      }, function(error) {
        callback(error, null);
      });
  }
};

module.exports = client;
