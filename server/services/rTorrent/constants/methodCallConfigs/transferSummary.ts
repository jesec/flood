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
  downRate: {
    methodCall: 'throttle.global_down.rate',
    transformValue: numberTransformer,
  },
  downTotal: {
    methodCall: 'throttle.global_down.total',
    transformValue: numberTransformer,
  },
} as const;

export default transferSummaryMethodCallConfigs;
