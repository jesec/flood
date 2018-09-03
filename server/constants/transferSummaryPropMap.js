'use strict';
const transferSummaryPropMap = new Map();

transferSummaryPropMap.set('upRate', {
  methodCall: 'throttle.global_up.rate',
  transformValue: Number,
});

transferSummaryPropMap.set('upTotal', {
  methodCall: 'throttle.global_up.total',
  transformValue: Number,
});

transferSummaryPropMap.set('upThrottle', {
  methodCall: 'throttle.global_up.max_rate',
  transformValue: Number,
});

transferSummaryPropMap.set('downRate', {
  methodCall: 'throttle.global_down.rate',
  transformValue: Number,
});

transferSummaryPropMap.set('downTotal', {
  methodCall: 'throttle.global_down.total',
  transformValue: Number,
});

transferSummaryPropMap.set('downThrottle', {
  methodCall: 'throttle.global_down.max_rate',
  transformValue: Number,
});

module.exports = transferSummaryPropMap;
