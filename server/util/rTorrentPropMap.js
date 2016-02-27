const rTorrentPropMap = {
  transferData: {
    uploadRate: 'get_up_rate',
    uploadTotal: 'get_up_total',
    uploadThrottle: 'throttle.global_up.max_rate',
    downloadRate: 'get_down_rate',
    downloadTotal: 'get_down_total',
    downloadThrottle: 'throttle.global_down.max_rate'
  }
};

module.exports = rTorrentPropMap;
