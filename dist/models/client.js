var rTorrent = require('./rtorrent');
var util = require('util');
var ClientUtil = require('./ClientUtil');
var FormatUtil = require('./FormatUtil');

function client() {
  if((this instanceof client) === false) {
    return new client();
  }
};

client.prototype.add = function(data, callback) {
  var commands = [
    [
      {
        methodName: 'execute',
        params: [
          'mkdir',
          '-p',
          data.destination
        ]
      },
      {
        methodName: 'load.start',
        params: [
          '',
          data.url,
          'd.directory.set="' + data.destination + '"'
        ]
      }
    ]
  ];

  rTorrent.get('system.multicall', commands).then(function(data) {
    callback(null, data);
  }, function(error) {
    callback(error, null);
  });
}

client.prototype.getTorrentList = function(callback) {
  rTorrent.get('d.multicall', ClientUtil.defaults.torrentPropertyMethods)
    .then(function(data) {
      try {
        // create torrent array, each item in the array being
        // an object with human-readable property values
        var torrents = ClientUtil.mapProps(
          ClientUtil.defaults.torrentProperties,
          data
        );
        // Calculate extra properties.
        torrents = torrents.map(function(torrent) {
          torrent.percentComplete = FormatUtil.percentComplete(
            torrent.bytesDone,
            torrent.sizeBytes
          );

          torrent.eta = FormatUtil.eta(
            torrent.downloadRate,
            torrent.bytesDone,
            torrent.sizeBytes
          );

          torrent.status = FormatUtil.status(
            torrent.isHashChecking,
            torrent.isComplete,
            torrent.isOpen,
            torrent.uploadRate,
            torrent.downloadRate,
            torrent.state
          );

          return torrent;
        });
      } catch (error) {
        console.log(error);
      }

      callback(null, torrents);
    }, function(error) {
      callback(error, null)
    });
};

client.prototype.stopTorrent = function(hash, callback) {
  if (!util.isArray(hash)) {
    hash = [hash];
  } else {
    hash = String(hash).split(',');
  }

  for (i = 0, len = hash.length; i < len; i++) {
    rTorrent.get('d.close', [hash[i]]).then(function(data) {
      callback(null, data);
    }, function(error) {
      callback(error, null);
    });
  }
};

client.prototype.startTorrent = function(hash, callback) {
  if (!util.isArray(hash)) {
    hash = [hash];
  } else {
    hash = String(hash).split(',');
  }

  for (i = 0, len = hash.length; i < len; i++) {
    rTorrent.get('d.resume', [hash[i]]).then(function(data) {
      callback(null, data);
    }, function(error) {
      callback(error, null);
    });

    rTorrent.get('d.start', [hash[i]]).then(function(data) {
      callback(null, data);
    }, function(error) {
      callback(error, null);
    });
  }
};

client.prototype.getClientStats = function(callback) {
  try {
    var request = ClientUtil.createMulticallRequest(ClientUtil.defaults.clientPropertyMethods);

    request = [request];

    rTorrent.get('system.multicall', request)
      .then(function(data) {
        callback(null, ClientUtil.mapProps(ClientUtil.defaults.clientProperties, data));
      }, function(error) {
        callback(error, null);
      });
  } catch(err) {
    console.log(err);
  }
}

module.exports = client;
