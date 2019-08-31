const objectUtil = require('../../shared/util/objectUtil');

const diskUsageServiceEvents = ['DISK_USAGE_CHANGE'];

module.exports = objectUtil.createSymbolMapFromArray(diskUsageServiceEvents);
