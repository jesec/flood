var express = require('express');
var router = express.Router();
var xmlrpc = require('xmlrpc');

var client = require('../models/client');
var history = require('../models/history');

var handleClientResponse = function (res) {
  return function (error, response) {
    if (error) {
      console.log(error);
    }
    res.json(response);
  }
}

router.post('/add', function(req, res, next) {
  client.add(req.body, handleClientResponse(res));
});

router.get('/history', function(req, res, next) {
  history.get(req.query, handleClientResponse(res));
});

router.get('/list', function(req, res, next) {
  client.getTorrentList(handleClientResponse(res));
});

router.put('/settings/speed-limits', function(req, res, next) {
  client.setSpeedLimits(req.body, handleClientResponse(res));
});

router.post('/start', function(req, res, next) {
  var hashes = req.body.hashes;
  client.startTorrent(hashes, handleClientResponse(res));
});

router.get('/stats', function(req, res, next) {
  client.getTransferStats(handleClientResponse(res));
});

router.post('/stop', function(req, res, next) {
  var hashes = req.body.hashes;
  client.stopTorrent(hashes, handleClientResponse(res));
});

router.post('/torrent-details', function(req, res, next) {
  var hash = req.body.hash;
  client.getTorrentDetails(hash, handleClientResponse(res));
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

  client.listMethods(method, args, handleClientResponse(res));
});

module.exports = router;
