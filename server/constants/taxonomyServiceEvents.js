'use strict';

const objectUtil = require('../../shared/util/objectUtil');

const torrentServiceEvents = [
  'TAXONOMY_DIFF_CHANGE'
];

module.exports = objectUtil.createSymbolMapFromArray(torrentServiceEvents);
