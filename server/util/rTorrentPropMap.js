const RTORRENT_PROPS_MAP = {
  transferData: {
    uploadRate: 'throttle.global_up.rate',
    uploadTotal: 'throttle.global_up.total',
    uploadThrottle: 'throttle.global_up.max_rate',
    downloadRate: 'throttle.global_down.rate',
    downloadTotal: 'throttle.global_down.total',
    downloadThrottle: 'throttle.global_down.max_rate',
  },
};

module.exports = RTORRENT_PROPS_MAP;
