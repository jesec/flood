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

      'priority',

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
      'isMultiFile',
      // 'isPexActive',
      'isPrivate',

      'tags',
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

      'd.priority=',

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
      'd.is_multi_file=',
      // 'd.is_pex_active=',
      'd.is_private=',

      'd.custom1=',
      'd.custom2=',
      'd.custom=sch_ignore', // ignore scheduler
      'cat="$t.multicall=d.hash=,t.url=,cat={@!@}"', // trackers
      'cat="$t.multicall=d.hash=,t.scrape_complete=,cat={@!@}"', // seeds
      'cat="$t.multicall=d.hash=,t.scrape_incomplete=,cat={@!@}"', // peers
      // 'cat=$d.views=',

      // 'd.mode='
    ],
    fileProperties: [
      'path',
      'pathComponents',
      'priority',
      'sizeBytes',
      'sizeChunks',
      'completedChunks'
    ],
    filePropertyMethods: [
      'f.path=',
      'f.path_components=',
      'f.priority=',
      'f.size_bytes=',
      'f.size_chunks=',
      'f.completed_chunks='
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
      't.group=',
      't.url=',
      't.id=',
      't.min_interval=',
      't.normal_interval=',
      't.type='
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
      'throttle.global_up.rate',
      'throttle.global_up.total',
      'throttle.global_up.max_rate',

      'throttle.global_down.rate',
      'throttle.global_down.total',
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
      'p.address=',
      'p.completed_percent=',
      'p.client_version=',
      'p.down_rate=',
      'p.down_total=',
      'p.up_rate=',
      'p.up_total=',
      'p.id=',
      'p.peer_rate=',
      'p.peer_total=',
      'p.is_encrypted=',
      'p.is_incoming='
    ]
  },

  // TODO clean this up, write comments...
  mapClientProps: (props, data) => {
    if (data.length === 0) {
      return [];
    }

    var index = 0;
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
        // Index is needed for setting a file's priorities.
        mappedObject[i].index = index++;
      }
    }

    return mappedObject;
  },

  // TODO remove this method
  createMulticallRequest: (methodCalls, params) => {
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
