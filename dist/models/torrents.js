var client = require('./client')();

function torrents() {

    if((this instanceof torrents) === false) {
        return new torrents();
    }
};

torrents.prototype.listTorrents = function(callback) {

    client.getTorrentList(callback);
};

torrents.prototype.stopTorrent = function(hash, callback) {

    client.stopTorrent(hash, callback);
};

torrents.prototype.startTorrent = function(hash, callback) {

    client.startTorrent(hash, callback);
};

module.exports = torrents;
