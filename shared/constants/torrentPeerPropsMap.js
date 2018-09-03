const torrentPeerPropsMap = {
  props: [
    'address',
    'completedPercent',
    'clientVersion',
    'downloadRate',
    'downloadTotal',
    'uploadRate',
    'uploadTotal',
    'id',
    'peerRate',
    'peerTotal',
    'isEncrypted',
    'isIncoming',
  ],
  methods: [
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
    'p.is_incoming=',
  ],
};

module.exports = torrentPeerPropsMap;
