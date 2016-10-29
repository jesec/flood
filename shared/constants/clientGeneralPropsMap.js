'use strict';

const clientGeneralPropsMap = {
  props: [
    'uploadRate',
    'uploadTotal',
    'uploadThrottle',

    'downloadRate',
    'downloadTotal',
    'downloadThrottle'
  ],
  methods: [
    'throttle.global_up.rate',
    'throttle.global_up.total',
    'throttle.global_up.max_rate',

    'throttle.global_down.rate',
    'throttle.global_down.total',
    'throttle.global_down.max_rate'
  ]
};

module.exports = clientGeneralPropsMap;
