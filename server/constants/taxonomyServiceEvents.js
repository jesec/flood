const objectUtil = require('../../shared/util/objectUtil');

const taxonomyServiceEvents = ['TAXONOMY_DIFF_CHANGE'];

module.exports = objectUtil.createSymbolMapFromArray(taxonomyServiceEvents);
