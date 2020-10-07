import {numberTransformer} from '../../util/rTorrentMethodCallUtil';

const transferSummaryMethodCallConfigs = {
  upRate: {
    methodCall: 'throttle.global_up.rate',
    transformValue: numberTransformer,
  },
  upTotal: {
    methodCall: 'throttle.global_up.total',
    transformValue: numberTransformer,
  },
  upThrottle: {
    methodCall: 'throttle.global_up.max_rate',
    transformValue: numberTransformer,
  },
  downRate: {
    methodCall: 'throttle.global_down.rate',
    transformValue: numberTransformer,
  },
  downTotal: {
    methodCall: 'throttle.global_down.total',
    transformValue: numberTransformer,
  },
  downThrottle: {
    methodCall: 'throttle.global_down.max_rate',
    transformValue: numberTransformer,
  },
} as const;

export default transferSummaryMethodCallConfigs;
