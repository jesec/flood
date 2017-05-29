'use strict';

const objectUtil = require('../../shared/util/objectUtil');

const torrentServiceEvents = [
  'FETCH_TORRENT_LIST_ERROR',
  'FETCH_TORRENT_LIST_SUCCESS',
  'TORRENT_LIST_DIFF_CHANGE'
];

module.exports = objectUtil.createSymbolMapFromArray(torrentServiceEvents);
