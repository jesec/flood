'use strict';

let express = require('express');
let router = express.Router();
let xmlrpc = require('xmlrpc');

let ajaxUtil = require('../util/ajaxUtil');
let client = require('../models/client');
let history = require('../models/history');
let uiSettings = require('../models/uiSettings');

router.get('/settings', (req, res, next) => {
  uiSettings.get(req.body.type, ajaxUtil.getResponseFn(res));
});

router.post('/settings', (req, res, next) => {
  uiSettings.set(req.body, ajaxUtil.getResponseFn(res));
});

router.post('/sort-props', (req, res, next) => {
  uiSettings.setSortProps(req.body, ajaxUtil.getResponseFn(res));
});

router.get('/sort-props', (req, res, next) => {
  uiSettings.getSortProps(ajaxUtil.getResponseFn(res));
});

router.get('/torrent-location', (req, res, next) => {
  uiSettings.getLatestTorrentLocation(ajaxUtil.getResponseFn(res));
});

router.post('/torrent-location', (req, res, next) => {
  uiSettings.setLatestTorrentLocation(req.body, ajaxUtil.getResponseFn(res));
});

module.exports = router;
