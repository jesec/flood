import {stringTransformer, booleanTransformer, numberTransformer} from '../../util/rTorrentMethodCallUtil';

const torrentPeerMethodCallConfigs = {
  id: {
    methodCall: 'p.id=',
    transformValue: stringTransformer,
  },
  address: {
    methodCall: 'p.address=',
    transformValue: stringTransformer,
  },
  clientVersion: {
    methodCall: 'p.client_version=',
    transformValue: stringTransformer,
  },
  completedPercent: {
    methodCall: 'p.completed_percent=',
    transformValue: numberTransformer,
  },
  downloadRate: {
    methodCall: 'p.down_rate=',
    transformValue: numberTransformer,
  },
  downloadTotal: {
    methodCall: 'p.down_total=',
    transformValue: numberTransformer,
  },
  uploadRate: {
    methodCall: 'p.up_rate=',
    transformValue: numberTransformer,
  },
  uploadTotal: {
    methodCall: 'p.up_total=',
    transformValue: numberTransformer,
  },
  peerRate: {
    methodCall: 'p.peer_rate=',
    transformValue: numberTransformer,
  },
  peerTotal: {
    methodCall: 'p.peer_total=',
    transformValue: numberTransformer,
  },
  isEncrypted: {
    methodCall: 'p.is_encrypted=',
    transformValue: booleanTransformer,
  },
  isIncoming: {
    methodCall: 'p.is_incoming=',
    transformValue: booleanTransformer,
  },
} as const;

export default torrentPeerMethodCallConfigs;
