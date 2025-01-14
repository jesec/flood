import {booleanTransformer, numberTransformer, stringTransformer} from '../../util/rTorrentMethodCallUtil';

const torrentPeerMethodCallConfigs = {
  address: {
    methodCall: 'p.address=',
    transformValue: (value: unknown) => {
      const address = value as string;
      return address.startsWith('[') ? address.slice(1, -1) : address;
    },
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
  uploadRate: {
    methodCall: 'p.up_rate=',
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
