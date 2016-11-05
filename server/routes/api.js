'use strict';

let express = require('express');

let ajaxUtil = require('../util/ajaxUtil');
let client = require('../models/client');
let clientRoutes = require('./client');
let FeedCollection = require('../models/FeedCollection');
let mediainfo = require('../util/mediainfo');
let NotificationCollection = require('../models/NotificationCollection');
let history = require('../models/history');
let passport = require('passport');
let router = express.Router();
let settings = require('../models/settings');

router.use('/', passport.authenticate('jwt', {session: false}));

router.use('/client', clientRoutes);

router.delete('/feed-monitor/:id', (req, res, next) => {
  FeedCollection.removeItem(req.params.id, ajaxUtil.getResponseFn(res));
});

router.get('/feed-monitor', (req, res, next) => {
  FeedCollection.getAll(req.body.query, ajaxUtil.getResponseFn(res));
});

router.get('/feed-monitor/feeds', (req, res, next) => {
  FeedCollection.getFeeds(req.body.query, ajaxUtil.getResponseFn(res));
});

router.put('/feed-monitor/feeds', (req, res, next) => {
  FeedCollection.addFeed(req.body, ajaxUtil.getResponseFn(res));
});

router.get('/feed-monitor/rules', (req, res, next) => {
  FeedCollection.getRules(req.body.query, ajaxUtil.getResponseFn(res));
});

router.put('/feed-monitor/rules', (req, res, next) => {
  FeedCollection.addRule(req.body, ajaxUtil.getResponseFn(res));
});

router.get('/history', (req, res, next) => {
  history.get(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/notifications', (req, res, next) => {
  NotificationCollection.getNotifications(req.query, ajaxUtil.getResponseFn(res));
});

router.delete('/notifications', (req, res, next) => {
  NotificationCollection.clearNotifications(req.query, ajaxUtil.getResponseFn(res));
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

router.get('/mediainfo', (req, res, next) => {
  mediainfo.getMediainfo(req.query, ajaxUtil.getResponseFn(res));
});

module.exports = router;
