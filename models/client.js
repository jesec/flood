var rTorrent = require('./rtorrent');
var util = require('util');

function client() {

    if((this instanceof client) === false) {
        return new client();
    }
};

var defaults = {
    torrentProperties: [
        'hash',
        'name',

        'state',
        'stateChanged',
        'isActive',

        'uploadRate',
        'uploadTotal',
        'downloadRate',
        'downloadTotal',
        'ratio',

        'bytesDone',
        'sizeBytes',

        'chunkSize',
        'chunksCompleted',

        'peersAccounted',
        'peersComplete',
        'peerExchange',
        'peersNotConnected',
        'trackerFocus',

        'basePath',
        'creationDate',

        'customSeedingTime',
        'customAddTime'
    ],
    torrentPropertyMethods: [
        'main',

        'd.get_hash=',
        'd.get_name=',

        'd.get_state=',
        'd.get_state_changed=',
        'd.is_active=',

        'd.get_up_rate=',
        'd.get_up_total=',
        'd.get_down_rate=',
        'd.get_down_total=',
        'd.get_ratio=',

        'd.get_bytes_done=',
        'd.get_size_bytes=',

        'd.get_chunk_size=',
        'd.get_completed_chunks=',

        'd.get_peers_accounted=',
        'd.get_peers_complete=',
        'd.get_peer_exchange=',
        'd.get_peers_not_connected=',
        'd.get_tracker_focus=',

        'd.get_base_path=',
        'd.get_creation_date=',

        'd.get_custom=seedingtime',
        'd.get_custom=addtime'
    ],
    clientProperties: [
        'uploadRate',
        'uploadTotal',

        'downloadRate',
        'downloadTotal'
    ],
    clientPropertyMethods: [
        'get_up_rate',
        'get_up_total',

        'get_down_rate',
        'get_down_total'
    ]
};

var mapProps = function(props, data) {

    var mappedObject = {};

    if (data[0].length === 1) {

        mappedObject = {};

        for (i = 0, len = data.length; i < len; i++) {
            mappedObject[props[i]] = data[i][0];
        }

    } else {

        for (i = 0, lenI = data.length; i < lenI; i++) {

            var hash = data[i][0];

            mappedObject[hash] = {};

            for (a = 0, lenA = props.length; a < lenA; a++) {
                mappedObject[hash][props[a]] = data[i][a];
            }
        }

    }

    return mappedObject;
};

var createMulticallRequest = function(data) {

    var methodCall = [];

    for (i = 0, len = data.length; i < len; i++) {
        methodCall.push({
            'methodName': data[i],
            'params': []
        });
    }

    return methodCall;
}

client.prototype.getTorrentList = function(callback) {

    try {

        rTorrent.get('d.multicall', defaults.torrentPropertyMethods)
            .then(function(data) {

                // create torrent array, each item in the array being
                // an object with human-readable property values
                var torrents = mapProps(defaults.torrentProperties, data, 'torrent-list');

                // add percent complete
                Object.keys(torrents).map(function(hash) {

                    torrents[hash]['percentComplete'] = (torrents[hash]['bytesDone'] / torrents[hash]['sizeBytes'] * 100).toFixed(2);
                });

                callback(null, torrents);
            }, function(error) {
                callback(error, null)
            });

    } catch (error) {
        console.log(error);
    }

};

client.prototype.stopTorrent = function(hash, callback) {

    if (!util.isArray(hash)) {
        hash = [hash];
    }

    rTorrent.get('d.stop', hash).then(function(data) {
        callback(null, data);
    }, function(error) {
        console.log(error);
        callback(error, null);
    });

};

client.prototype.startTorrent = function(hash, callback) {

    if (!util.isArray(hash)) {
        hash = [hash];
    }

    rTorrent.get('d.start', hash).then(function(data) {
        callback(null, data);
    }, function(error) {
        console.log(error);
        callback(error, null);
    });

};

client.prototype.getClientStats = function(callback) {

    rTorrent.get('system.multicall', [createMulticallRequest(defaults.clientPropertyMethods)])
        .then(function(data) {
            callback(null, mapProps(defaults.clientProperties, data));
        }, function(error) {
            callback(error, null);
        });

}

module.exports = client;
