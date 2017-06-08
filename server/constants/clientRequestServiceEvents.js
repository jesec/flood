'use strict';

const objectUtil = require('../../shared/util/objectUtil');

const clientRequestServiceEvents = [
  'PROCESS_TORRENT',
  'PROCESS_TORRENT_LIST_END',
  'PROCESS_TORRENT_LIST_START',
  'PROCESS_TRANSFER_RATE_START',
  'TORRENTS_REMOVED'
];

module.exports = objectUtil.createSymbolMapFromArray(
  clientRequestServiceEvents
);
