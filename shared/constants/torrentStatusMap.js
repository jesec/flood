'use strict';

let objectUtil = require('../util/objectUtil');

let torrentStatusMap = objectUtil.reflect({
  ch: 'checking',
  sd: 'seeding',
  p: 'paused',
  c: 'complete',
  d: 'downloading',
  ad: 'activelyDownloading',
  au: 'activelyUploading',
  s: 'stopped',
  e: 'error',
  i: 'inactive',
  a: 'active'
});

torrentStatusMap.statusShorthand = [
  'ch', 'sd', 'p', 'c', 'd', 'ad', 'au', 's', 'e', 'i', 'a'
];

module.exports = torrentStatusMap;
