'use strict';

let objectUtil = require('../util/objectUtil');

let torrentStatusMap = objectUtil.reflect({
  ch: 'checking',
  sd: 'seeding',
  p: 'paused',
  c: 'complete',
  d: 'downloading',
  s: 'stopped',
  e: 'error',
  i: 'inactive',
  a: 'active'
});

torrentStatusMap.statusShorthand = [
  'ch', 'sd', 'p', 'c', 'd', 's', 'e', 'i', 'a'
];

module.exports = torrentStatusMap;
