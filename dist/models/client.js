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
        'isComplete',
        'isHashChecking',
        'isOpen',

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
        'd.get_complete=',
        'd.is_hash_checking=',
        'd.is_open=',

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

    var mappedObject = [];

    if (data[0].length === 1) {

        mappedObject = {};

        for (i = 0, len = data.length; i < len; i++) {
            mappedObject[props[i]] = data[i][0];
        }

    } else {

        for (i = 0, lenI = data.length; i < lenI; i++) {

            mappedObject[i] = {};

            for (a = 0, lenA = props.length; a < lenA; a++) {
                mappedObject[i][props[a]] = data[i][a];
            }
        }

    }

    return mappedObject;
};

var createMulticallRequest = function(data, params) {

    params = params || [];

    var methodCall = [];

    if (!util.isArray(data)) {
        data = [data];
    }

    for (i = 0, len = data.length; i < len; i++) {
        methodCall.push({
            'methodName': data[i],
            'params': params
        });
    }

    return methodCall;
}

client.prototype.getTorrentList = function(callback) {

    try {

        rTorrent.get('d.multicall', defaults.torrentPropertyMethods)
            .then(function(data) {

                try {

                    // create torrent array, each item in the array being
                    // an object with human-readable property values
                    var torrents = mapProps(defaults.torrentProperties, data, 'torrent-list');

                    // add percent complete
                    torrents = torrents.map(function(torrent) {

                        var hash = torrent.hash;

                        var percentComplete = function() {
                            return (torrent['bytesDone'] / torrent['sizeBytes'] * 100).toFixed(2);
                        }

                        var eta = function() {

                            if (torrent['downloadRate'] > 0) {

                                var seconds = (torrent['sizeBytes'] - torrent['bytesDone']) / torrent['downloadRate'];
                                var years = Math.floor(seconds / 31536000);
                                var weeks = Math.floor((seconds % 31536000) / 604800);
                                var days = Math.floor(((seconds % 31536000) % 604800) / 86400);
                                var hours = Math.floor((((seconds % 31536000) % 604800) % 86400) / 3600);
                                var minutes = Math.floor(((((seconds % 31536000) % 604800) % 86400) % 3600) / 60);
                                var wholeSeconds = Math.floor((((((seconds % 31536000) % 604800) % 86400) % 3600) % 60) / 60);

                                var timeRemaining = {};
                                seconds = Math.floor(seconds);

                                if (years > 0) {
                                    timeRemaining = {
                                        years: years,
                                        weeks: weeks,
                                        seconds: seconds
                                    }
                                } else if (weeks > 0) {
                                    timeRemaining = {
                                        weeks: weeks,
                                        days: days,
                                        seconds: seconds
                                    }
                                } else if (days > 0) {
                                    timeRemaining = {
                                        days: days,
                                        hours: hours,
                                        seconds: seconds
                                    }
                                } else if (hours > 0) {
                                    timeRemaining = {
                                        hours: hours,
                                        minutes: minutes,
                                        seconds: seconds
                                    }
                                } else if (minutes > 0) {
                                    timeRemaining = {
                                        minutes: minutes,
                                        seconds: wholeSeconds
                                    }
                                } else {
                                    timeRemaining = {
                                        seconds: wholeSeconds
                                    }
                                }

                                return timeRemaining;

                            } else {

                                return 'Infinity';
                            }

                        }

                        var status = function() {

                            var torrentStatus = [];

                            if (torrent['isHashChecking'] === '1') {
                                torrentStatus.push('is-checking');
                            } else if (torrent['isComplete'] === '1' && torrent['isOpen'] === '1' && torrent['state'] === '1') {
                                // torrentStatus.push('is-seeding');
                                torrentStatus.push('is-completed');
                        	} else if (torrent['isComplete'] === '1' && torrent['isOpen'] === '1' && torrent['state'] === '0') {
                                torrentStatus.push('is-paused');
                        	} else if (torrent['isComplete'] === '1' && torrent['isOpen'] === '0' && torrent['state'] === '0') {
                                torrentStatus.push('is-completed');
                        	} else if (torrent['isComplete'] === '1' && torrent['isOpen'] === '0' && torrent['state'] === '1') {
                                torrentStatus.push('is-completed');
                        	} else if (torrent['isComplete'] === '0' && torrent['isOpen'] === '1' && torrent['state'] === '1') {
                                torrentStatus.push('is-downloading');
                        	} else if (torrent['isComplete'] === '0' && torrent['isOpen'] === '1' && torrent['state'] === '0') {
                                torrentStatus.push('is-paused');
                        	} else if (torrent['isComplete'] === '0' && torrent['isOpen'] === '0' && torrent['state'] === '1') {
                                torrentStatus.push('is-stopped');
                        	} else if (torrent['isComplete'] === '0' && torrent['isOpen'] === '0' && torrent['state'] === '0') {
                                torrentStatus.push('is-stopped');
                        	}

                            if (torrent['uploadRate'] === '0' && torrent['downloadRate'] === '0') {
                                torrentStatus.push('is-inactive');
                            } else {
                                torrentStatus.push('is-active');
                            }

                            return torrentStatus.join(' ');

                        }

                        torrent['percentComplete'] = percentComplete();
                        torrent['eta'] = eta();
                        torrent['status'] = status();

                        return torrent;
                    });

                } catch (error) {
                    console.log(error);
                }

                callback(null, torrents);
            }, function(error) {
                callback(error, null)
            });

    } catch (error) {
        console.log(error);
    }

};

client.prototype.stopTorrent = function(hash, callback) {

    hash = hash.split(',');

    if (!util.isArray(hash)) {
        hash = [hash];
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

    hash = hash.split(',');

    if (!util.isArray(hash)) {
        hash = [hash];
    }

    for (i = 0, len = hash.length; i < len; i++) {

        rTorrent.get('d.resume', [hash[i]]).then(function(data) {
            callback(null, data);
        }, function(error) {
            callback(error, null);
        });

    }

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
