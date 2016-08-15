'use strict';

const OBJECT_UTIL = {
  reflect: (hash) => {
    return Object.keys(hash).reduce((memo, key) => {
      memo[key] = hash[key];
      memo[hash[key]] = key;
      return memo;
    }, {});
  }
}

module.exports = OBJECT_UTIL;
