var util = require('util');

var ClientUtil = {
  defaults: {
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

      'seeding',
      'added'
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
  },

  mapProps: function(props, data) {
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
  },

  createMulticallRequest: function(data, params) {
    params = params || [];
    var methodCall = [];

    if (!util.isArray(data)) {
      data = [data];
    }

    for (i = 0, len = data.length; i < len; i++) {
      var param = [];
      if (params[i]) {
        param = [params[i]];
      }
      methodCall.push({
        'methodName': data[i],
        'params': param
      });
    }

    return methodCall;
  }

}

module.exports = ClientUtil;
