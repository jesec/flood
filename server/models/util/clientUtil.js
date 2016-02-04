var util = require('util');

var clientUtil = {
  defaults: {
    torrentProperties: [
      'hash',
      'name',
      'message',

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

      'message',
      'peersAccounted',
      'peersComplete',
      'peerExchange',
      'peersNotConnected',
      'trackerFocus',

      'directory',
      'filename',
      'basePath',
      'baseFilename',
      'directoryBase',

      'seeding',
      'added'
    ],
    torrentPropertyMethods: [
      'main',

      'd.get_hash=',
      'd.get_name=',
      'd.get_message=',

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

      'd.get_message=',
      'd.get_peers_accounted=',
      'd.get_peers_complete=',
      'd.get_peer_exchange=',
      'd.get_peers_not_connected=',
      'd.get_tracker_focus=',

      'd.get_directory=',
      'd.get_base_filename=',
      'd.get_base_path=',
      'd.get_base_filename=',
      'd.get_directory_base=',

      'd.get_custom=seedingtime',
      'd.get_custom=addtime'
    ],
    fileProperties: [
      'path',
      'pathComponents',
      'pathDepth',
      'priority',
      'sizeBytes'
    ],
    filePropertyMethods: [
      'f.get_path=',
      'f.get_path_components=',
      'f.get_path_depth=',
      'f.get_priority=',
      'f.get_size_bytes='
    ],
    trackerProperties: [
      'group',
      'url',
      'id',
      'minInterval',
      'normalInterval',
      'type'
    ],
    trackerPropertyMethods: [
      't.get_group=',
      't.get_url=',
      't.get_id=',
      't.get_min_interval=',
      't.get_normal_interval=',
      't.get_type='
    ],
    clientProperties: [
      'uploadRate',
      'uploadTotal',
      'uploadThrottle',

      'downloadRate',
      'downloadTotal',
      'downloadThrottle'
    ],
    clientPropertyMethods: [
      'get_up_rate',
      'get_up_total',
      'throttle.global_up.max_rate',

      'get_down_rate',
      'get_down_total',
      'throttle.global_down.max_rate'
    ],
    peerProperties: [
      'address',
      'completedPercent',
      'clientVersion',
      'downloadRate',
      'downloadTotal',
      'uploadRate',
      'uploadTotal',
      'id',
      'peerRate',
      'peerTotal',,
      'isEncrypted',
      'isIncoming'
    ],
    peerPropertyMethods: [
      'p.get_address=',
      'p.get_completed_percent=',
      'p.get_client_version=',
      'p.get_down_rate=',
      'p.get_down_total=',
      'p.get_up_rate=',
      'p.get_up_total=',
      'p.get_id=',
      'p.get_peer_rate=',
      'p.get_peer_total=',
      'p.is_encrypted=',
      'p.is_incoming='
    ]
  },

  mapClientProps: function(props, data) {
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

  createMulticallRequest: function(methodCalls, params) {
    params = params || [];
    var methodCall = [];

    if (!util.isArray(methodCalls)) {
      methodCalls = [methodCalls];
    }

    for (i = 0, len = methodCalls.length; i < len; i++) {
      var param = [''];
      if (params[i]) {
        param = [params[i]];
      }
      methodCall.push({
        'methodName': methodCalls[i],
        'params': param
      });
    }

    return methodCall;
  }

}

module.exports = clientUtil;
