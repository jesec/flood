var client = require('./client')();

function torrents() {
  if((this instanceof torrents) === false) {
    return new torrents();
  }
};

torrents.prototype.add = function(data, callback) {
  client.add(data, callback);
};

torrents.prototype.listTorrents = function(callback) {
  client.getTorrentList(callback);
};

torrents.prototype.stopTorrent = function(hashes, callback) {
  client.stopTorrent(hashes, callback);
};

torrents.prototype.startTorrent = function(hashes, callback) {
  client.startTorrent(hashes, callback);
};

module.exports = torrents;
