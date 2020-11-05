import {booleanTransformer, numberTransformer, stringTransformer} from '../../util/rTorrentMethodCallUtil';

const torrentTrackerMethodCallConfigs = {
  url: {
    methodCall: 't.url=',
    transformValue: stringTransformer,
  },
  type: {
    methodCall: 't.type=',
    transformValue: numberTransformer,
  },
  isEnabled: {
    methodCall: 't.is_enabled=',
    transformValue: booleanTransformer,
  },
} as const;

export default torrentTrackerMethodCallConfigs;
