'use strict';

let express = require('express');

let ajaxUtil = require('../util/ajaxUtil');
let client = require('../models/client');
let clientRoutes = require('./client');
let history = require('../models/history');
let passport = require('passport');
let router = express.Router();
let settings = require('../models/settings');

history.startPolling();

router.use('/', passport.authenticate('jwt', {session: false}));

router.use('/client', clientRoutes);

router.get('/history', (req, res, next) => {
  history.get(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/settings', (req, res, next) => {
  settings.get(req.query, ajaxUtil.getResponseFn(res));
});

router.patch('/settings', (req, res, next) => {
  settings.set(req.body, ajaxUtil.getResponseFn(res));
});

router.get('/stats', (req, res, next) => {
  client.getTransferStats(ajaxUtil.getResponseFn(res));
});

module.exports = router;
