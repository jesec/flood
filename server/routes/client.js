'use strict';
const express = require('express');
const multer = require('multer');

const ajaxUtil = require('../util/ajaxUtil');
const booleanCoerce = require('../middleware/booleanCoerce');
const client = require('../models/client');
const clientRequestService = require('../services/clientRequestService');
const router = express.Router();

const upload = multer({
  dest: 'uploads/',
  limits: {fileSize: 10000000},
  storage: multer.memoryStorage()
});

router.post('/add', function(req, res, next) {
  client.addUrls(req.body, ajaxUtil.getResponseFn(res));
});

router.post(
  '/add-files',
  upload.array('torrents'),
  booleanCoerce('isBasePath'),
  function(req, res, next) {
    client.addFiles(req, ajaxUtil.getResponseFn(res));
  }
);

router.get('/settings', function(req, res, next) {
  client.getSettings(req.query, ajaxUtil.getResponseFn(res));
});

router.patch('/settings', function(req, res, next) {
  client.setSettings(req.body, ajaxUtil.getResponseFn(res));
});

router.put('/settings/speed-limits', function(req, res, next) {
  client.setSpeedLimits(req.body, ajaxUtil.getResponseFn(res));
});

router.post('/start', function(req, res, next) {
  client.startTorrent(req.body.hashes, ajaxUtil.getResponseFn(res));
});

router.post('/stop', function(req, res, next) {
  client.stopTorrent(req.body.hashes, ajaxUtil.getResponseFn(res));
});

router.post('/torrent-details', function(req, res, next) {
  client.getTorrentDetails(req.body.hash, ajaxUtil.getResponseFn(res));
});

router.get('/torrents', function(req, res, next) {
  client.getTorrentList(ajaxUtil.getResponseFn(res));
});

router.patch('/torrents/:hash/priority', function(req, res, next) {
  client.setPriority(req.params.hash, req.body, ajaxUtil.getResponseFn(res));
});

router.patch('/torrents/:hash/file-priority', function(req, res, next) {
  client.setFilePriority(req.params.hash, req.body, ajaxUtil.getResponseFn(res));
});

router.post('/torrents/check-hash', function(req, res, next) {
  client.checkHash(req.body.hash, ajaxUtil.getResponseFn(res));
});

router.post('/torrents/move', function(req, res, next) {
  client.moveTorrents(req.body, ajaxUtil.getResponseFn(res));
});

router.post('/torrents/delete', function(req, res, next) {
  const {deleteData, hash: hashes} = req.body;
  const callback = ajaxUtil.getResponseFn(res);

  clientRequestService
    .removeTorrents({hashes, deleteData})
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

router.get('/torrents/taxonomy', function(req, res, next) {
  client.getTorrentTaxonomy(ajaxUtil.getResponseFn(res));
});

router.patch('/torrents/taxonomy', function(req, res, next) {
  client.setTaxonomy(req.body, ajaxUtil.getResponseFn(res));
});

router.get('/torrents/status-count', function(req, res, next) {
  client.getTorrentStatusCount(ajaxUtil.getResponseFn(res));
});

router.get('/torrents/tag-count', function(req, res, next) {
  client.getTorrentTagCount(ajaxUtil.getResponseFn(res));
});

router.get('/torrents/tracker-count', function(req, res, next) {
  client.getTorrentTrackerCount(ajaxUtil.getResponseFn(res));
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
