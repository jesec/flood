'use strict';

const diffActionTypes = [
  'ITEM_ADDED',
  'ITEM_CHANGED',
  'ITEM_REMOVED'
];

module.exports = diffActionTypes.reduce((memo, key) => {
  memo[key] = key;

  return memo;
}, {});
