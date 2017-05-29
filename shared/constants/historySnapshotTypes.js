'use strict';

const objectUtil = require('../util/objectUtil');

const historySnapshotTypes = {
  FIVE_MINUTE: 'fiveMin',
  THIRTY_MINUTE: 'thirtyMin',
  HOUR: 'hour',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
};

module.exports = objectUtil.reflect(historySnapshotTypes);
