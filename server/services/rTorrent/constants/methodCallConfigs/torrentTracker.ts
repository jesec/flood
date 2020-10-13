import {booleanTransformer, numberTransformer, stringTransformer} from '../../util/rTorrentMethodCallUtil';

const torrentTrackerMethodCallConfigs = {
  id: {
    methodCall: 't.id=',
    transformValue: stringTransformer,
  },
  url: {
    methodCall: 't.url=',
    transformValue: stringTransformer,
  },
  type: {
    methodCall: 't.type=',
    transformValue: numberTransformer,
  },
  group: {
    methodCall: 't.group=',
    transformValue: numberTransformer,
  },
  minInterval: {
    methodCall: 't.min_interval=',
    transformValue: numberTransformer,
  },
  normalInterval: {
    methodCall: 't.normal_interval=',
    transformValue: numberTransformer,
  },
  isEnabled: {
    methodCall: 't.is_enabled=',
    transformValue: booleanTransformer,
  },
} as const;

export default torrentTrackerMethodCallConfigs;
