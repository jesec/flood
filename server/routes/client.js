'use strict';

let express = require('express');
let router = express.Router();
let xmlrpc = require('xmlrpc');

let ajaxUtil = require('../util/ajaxUtil');
let client = require('../models/client');
let history = require('../models/history');

router.post('/add', function(req, res, next) {
  client.add(req.body, ajaxUtil.getResponseFn(res));
});

router.get('/history', function(req, res, next) {
  history.get(req.query, ajaxUtil.getResponseFn(res));
});

router.put('/settings/speed-limits', function(req, res, next) {
  client.setSpeedLimits(req.body, ajaxUtil.getResponseFn(res));
});

router.post('/start', function(req, res, next) {
  var hashes = req.body.hashes;
  client.startTorrent(hashes, ajaxUtil.getResponseFn(res));
});

router.get('/stats', function(req, res, next) {
  client.getTransferStats(ajaxUtil.getResponseFn(res));
});

router.post('/stop', function(req, res, next) {
  var hashes = req.body.hashes;
  client.stopTorrent(hashes, ajaxUtil.getResponseFn(res));
});

router.post('/torrent-details', function(req, res, next) {
  var hash = req.body.hash;
  client.getTorrentDetails(hash, ajaxUtil.getResponseFn(res));
});

router.get('/torrents', function(req, res, next) {
  client.getTorrentList(ajaxUtil.getResponseFn(res));
});

router.patch('/torrents/:hash/priority', function(req, res, next) {
  client.setPriority(req.params.hash, req.body, ajaxUtil.getResponseFn(res));
});

router.get('/torrents/status-count', function(req, res, next) {
  client.getTorrentStatusCount(ajaxUtil.getResponseFn(res));
});

router.get('/torrents/tracker-count', function(req, res, next) {
  client.getTorrentTrackerCount(ajaxUtil.getResponseFn(res));
});

router.post('/torrents/delete', function(req, res, next) {
  var hash = req.body.hash;
  client.deleteTorrents(hash, ajaxUtil.getResponseFn(res));
});

router.get('/methods.json', function(req, res, next) {
  var type = req.query.type;
  var args = req.query.args;
  var method = 'system.listMethods';

  if (type === 'help') {
    method = 'system.methodHelp';
  } else if (type === 'signature') {
    method = 'system.methodSignature';
  }

  client.listMethods(method, args, ajaxUtil.getResponseFn(res));
});

module.exports = router;
