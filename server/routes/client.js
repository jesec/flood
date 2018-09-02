const express = require('express');
const multer = require('multer');

const ajaxUtil = require('../util/ajaxUtil');
const booleanCoerce = require('../middleware/booleanCoerce');
const client = require('../models/client');
const router = express.Router();

const upload = multer({
  dest: 'uploads/',
  limits: {fileSize: 10000000},
  storage: multer.memoryStorage()
});

router.get('/connection-test', function(req, res, next) {
  req.services.clientGatewayService.testGateway()
    .then((response) => {
      res.status(200).json({isConnected: true});
    }).catch(error => {
      res.status(500).json({isConnected: false});
    });
});

router.post('/connection-test', function(req, res, next) {
  req.services.clientGatewayService.testGateway(req.body)
    .then((response) => {
      res.status(200).json({isConnected: true});
    }).catch(error => {
      res.status(500).json({isConnected: false});
    });
});

router.post('/add', function(req, res, next) {
  client.addUrls(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

router.post(
  '/add-files',
  upload.array('torrents'),
  booleanCoerce('isBasePath'),
  function(req, res, next) {
    client.addFiles(req.user, req.services, req, ajaxUtil.getResponseFn(res));
  }
);

router.get('/settings', function(req, res, next) {
  client.getSettings(req.user, req.services, req.query, ajaxUtil.getResponseFn(res));
});

router.patch('/settings', function(req, res, next) {
  client.setSettings(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

router.put('/settings/speed-limits', function(req, res, next) {
  client.setSpeedLimits(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

router.post('/start', function(req, res, next) {
  client.startTorrent(req.user, req.services, req.body.hashes, ajaxUtil.getResponseFn(res));
});

router.post('/stop', function(req, res, next) {
  client.stopTorrent(req.user, req.services, req.body.hashes, ajaxUtil.getResponseFn(res));
});

router.post('/torrent-details', function(req, res, next) {
  client.getTorrentDetails(req.user, req.services, req.body.hash, ajaxUtil.getResponseFn(res));
});

router.patch('/torrents/:hash/priority', function(req, res, next) {
  client.setPriority(req.user, req.services, req.params.hash, req.body, ajaxUtil.getResponseFn(res));
});

router.patch('/torrents/:hash/file-priority', function(req, res, next) {
  client.setFilePriority(req.user, req.services, req.params.hash, req.body, ajaxUtil.getResponseFn(res));
});

router.post('/torrents/check-hash', function(req, res, next) {
  client.checkHash(req.user, req.services, req.body.hash, ajaxUtil.getResponseFn(res));
});

router.post('/torrents/move', function(req, res, next) {
  client.moveTorrents(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

router.post('/torrents/delete', function(req, res, next) {
  const {deleteData, hash: hashes} = req.body;
  const callback = ajaxUtil.getResponseFn(res);

  req.services.clientGatewayService
    .removeTorrents({hashes, deleteData})
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

router.patch('/torrents/taxonomy', function(req, res, next) {
  client.setTaxonomy(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
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

  client.listMethods(req.user, req.services, method, args, ajaxUtil.getResponseFn(res));
});

module.exports = router;
