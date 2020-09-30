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
} as const;

export interface TorrentPeer {
  index: number;
  country: string;
  address: string;
  completedPercent: number;
  clientVersion: string;
  downloadRate: number;
  downloadTotal: number;
  uploadRate: number;
  uploadTotal: number;
  id: string;
  peerRate: number;
  peerTotal: number;
  isEncrypted: boolean;
  isIncoming: boolean;
}

export default torrentPeerPropsMap;
