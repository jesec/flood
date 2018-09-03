'use strict';

const objectUtil = require('../../shared/util/objectUtil');

const notificationServiceEvents = ['NOTIFICATION_COUNT_CHANGE'];

module.exports = objectUtil.createSymbolMapFromArray(notificationServiceEvents);
