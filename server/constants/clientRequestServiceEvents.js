'use strict';

const objectUtil = require('../../shared/util/objectUtil');

const torrentServiceEvents = [
  'PROCESS_TORRENT',
  'PROCESS_TORRENT_LIST_END',
  'PROCESS_TORRENT_LIST_START',
  'PROCESS_TRANSFER_RATE_START',
];

module.exports = objectUtil.createSymbolMapFromArray(torrentServiceEvents);
