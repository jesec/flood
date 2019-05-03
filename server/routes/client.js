const express = require('express');
const multer = require('multer');

const ajaxUtil = require('../util/ajaxUtil');
const booleanCoerce = require('../middleware/booleanCoerce');
const client = require('../models/client');

const router = express.Router();

const upload = multer({
  dest: 'uploads/',
  limits: {fileSize: 10000000},
  storage: multer.memoryStorage(),
});

router.get('/connection-test', (req, res) => {
  req.services.clientGatewayService
    .testGateway()
    .then(() => {
      res.status(200).json({isConnected: true});
    })
    .catch(() => {
      res.status(500).json({isConnected: false});
    });
});

router.post('/connection-test', (req, res) => {
  req.services.clientGatewayService
    .testGateway(req.body)
    .then(() => {
      res.status(200).json({isConnected: true});
    })
    .catch(() => {
      res.status(500).json({isConnected: false});
    });
});

router.post('/add', (req, res) => {
  client.addUrls(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

router.post('/add-files', upload.array('torrents'), booleanCoerce('isBasePath'), (req, res) => {
  client.addFiles(req.user, req.services, req, ajaxUtil.getResponseFn(res));
});

router.get('/settings', (req, res) => {
  client.getSettings(req.user, req.services, req.query, ajaxUtil.getResponseFn(res));
});

router.patch('/settings', (req, res) => {
  client.setSettings(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

router.put('/settings/speed-limits', (req, res) => {
  client.setSpeedLimits(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

router.post('/start', (req, res) => {
  client.startTorrent(req.user, req.services, req.body.hashes, ajaxUtil.getResponseFn(res));
});

router.post('/stop', (req, res) => {
  client.stopTorrent(req.user, req.services, req.body.hashes, ajaxUtil.getResponseFn(res));
});

router.post('/torrent-details', (req, res) => {
  client.getTorrentDetails(req.user, req.services, req.body.hash, ajaxUtil.getResponseFn(res));
});

router.patch('/torrents/:hash/priority', (req, res) => {
  client.setPriority(req.user, req.services, req.params.hash, req.body, ajaxUtil.getResponseFn(res));
});

router.patch('/torrents/:hash/file-priority', (req, res) => {
  client.setFilePriority(req.user, req.services, req.params.hash, req.body, ajaxUtil.getResponseFn(res));
});

router.post('/torrents/check-hash', (req, res) => {
  client.checkHash(req.user, req.services, req.body.hash, ajaxUtil.getResponseFn(res));
});

router.post('/torrents/move', (req, res) => {
  client.moveTorrents(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

router.post('/torrents/delete', (req, res) => {
  const {deleteData, hash: hashes} = req.body;
  const callback = ajaxUtil.getResponseFn(res);

  req.services.clientGatewayService
    .removeTorrents({hashes, deleteData})
    .then(callback)
    .catch(err => {
      callback(null, err);
    });
});

router.patch('/torrents/taxonomy', (req, res) => {
  client.setTaxonomy(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

router.get('/methods.json', (req, res) => {
  const {type} = req.query;
  const {args} = req.query;
  let method = 'system.listMethods';

  if (type === 'help') {
    method = 'system.methodHelp';
  } else if (type === 'signature') {
    method = 'system.methodSignature';
  }

  client.listMethods(req.user, req.services, method, args, ajaxUtil.getResponseFn(res));
});

module.exports = router;
