import {numberTransformer} from './rTorrentMethodCall';

const transferSummaryMethodCallConfigs = [
  {
    propLabel: 'upRate',
    methodCall: 'throttle.global_up.rate',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'upTotal',
    methodCall: 'throttle.global_up.total',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'upThrottle',
    methodCall: 'throttle.global_up.max_rate',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'downRate',
    methodCall: 'throttle.global_down.rate',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'downTotal',
    methodCall: 'throttle.global_down.total',
    transformValue: numberTransformer,
  },
  {
    propLabel: 'downThrottle',
    methodCall: 'throttle.global_down.max_rate',
    transformValue: numberTransformer,
  },
] as const;

export default transferSummaryMethodCallConfigs;
