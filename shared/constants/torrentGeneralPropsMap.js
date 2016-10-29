'use strict';

const torrentGeneralPropsMap = {
  props: [
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
  methods: [
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
  ]
};

module.exports = torrentGeneralPropsMap;
