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

      // 'chunkSize',
      // 'chunksCompleted',

      'connectedPeers',
      'connectedSeeds',
      // 'peerExchange',
      'peersConnected',
      // 'peersNotConnected',
      // 'trackerFocus',

      'directory',
      'filename',
      'basePath',
      'baseFilename',
      'directoryBase',

      'seeding',
      'added',

      // 'leeches',
      // 'seeds',
      'creationDate',
      'freeDiskSpace',
      // 'localId',
      // 'localIdHtml',
      // 'maxFileSize',
      // 'maxSizePex',
      'throttleName',
      // 'tiedToFile',
      // 'trackerNumWant',
      // 'trackerSize',
      // 'isMultiFile',
      // 'isPexActive',
      'isPrivate',

      'comment',
      'ignoreScheduler',
      'trackers',
      'totalSeeds',
      'totalPeers',
      // 'cat_dViews',

      // 'mode'
    ],
    torrentPropertyMethods: [
      '', // yep, rTorrent requires an empty string as the first item.
      'main',

      'd.hash=',
      'd.name=',
      'd.message=',

      'd.state=',
      'd.state_changed=',
      'd.is_active=',
      'd.complete=',
      'd.is_hash_checking=',
      'd.is_open=',

      'd.up.rate=',
      'd.up.total=',
      'd.down.rate=',
      'd.down.total=',
      'd.ratio=',

      'd.bytes_done=',
      'd.size_bytes=',

      // 'd.chunk_size=',
      // 'd.completed_chunks=',

      'd.peers_accounted=', // connnected peers
      'd.peers_complete=', // connected seeds
      // 'd.peer_exchange=',
      'd.peers_connected=', // connected peers + seeds
      // 'd.peers_not_connected=',
      // 'd.tracker_focus=',

      'd.directory=',
      'd.base_filename=',
      'd.base_path=',
      'd.base_filename=',
      'd.directory_base=',

      'd.custom=seedingtime',
      'd.custom=addtime',

      // 'd.connection_leech=',
      // 'd.connection_seed=',
      'd.creation_date=',
      'd.free_diskspace=',
      // 'd.local_id=',
      // 'd.local_id_html=',
      // 'd.max_file_size=',
      // 'd.max_size_pex=',
      'd.throttle_name=',
      // 'd.tied_to_file=',
      // 'd.tracker_numwant=',
      // 'd.tracker_size=',
      // 'd.is_multi_file=',
      // 'd.is_pex_active=',
      'd.is_private=',

      'd.custom2=',
      'd.custom=sch_ignore', // ignore scheduler
      'cat="$t.multicall=d.hash=,t.get_url=,cat={@!@}"',
      'cat="$t.multicall=d.hash=,t.scrape_complete=,cat={@!@}"', // total seeds
      'cat="$t.multicall=d.hash=,t.scrape_incomplete=,cat={@!@}"', // total peers
      // 'cat=$d.views=',

      // 'd.mode='
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
