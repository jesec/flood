'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();

const ajaxUtil = require('../util/ajaxUtil');
const client = require('../models/client');
const clientRoutes = require('./client');
const clientActivityStream = require('../middleware/clientActivityStream');
const eventStream = require('../middleware/eventStream');
const feedService = require('../services/feedService');
const Filesystem = require('../models/Filesystem');
const historyService = require('../services/historyService');
const mediainfo = require('../util/mediainfo');
const notificationService = require('../services/notificationService');
const settings = require('../models/settings');

router.use('/', passport.authenticate('jwt', {session: false}));

router.use('/client', clientRoutes);

router.get('/activity-stream', eventStream, clientActivityStream);

router.get('/download', (req, res, next) => {
  client.downloadFiles(req.query.hash, req.query.files, res);
});

router.delete('/feed-monitor/:id', (req, res, next) => {
  feedService.removeItem(req.params.id, ajaxUtil.getResponseFn(res));
});

router.get('/feed-monitor', (req, res, next) => {
  feedService.getAll(req.body.query, ajaxUtil.getResponseFn(res));
});

router.get('/feed-monitor/feeds', (req, res, next) => {
  feedService.getFeeds(req.body.query, ajaxUtil.getResponseFn(res));
});

router.put('/feed-monitor/feeds', (req, res, next) => {
  feedService.addFeed(req.body, ajaxUtil.getResponseFn(res));
});

router.get('/feed-monitor/rules', (req, res, next) => {
  feedService.getRules(req.body.query, ajaxUtil.getResponseFn(res));
});

router.put('/feed-monitor/rules', (req, res, next) => {
  feedService.addRule(req.body, ajaxUtil.getResponseFn(res));
});

router.get('/directory-list', (req, res, next) => {
  Filesystem.getDirectoryList(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/history', (req, res, next) => {
  historyService.getHistory(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/mediainfo', (req, res, next) => {
  mediainfo.getMediainfo(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/notifications', (req, res, next) => {
  notificationService.getNotifications(req.query, ajaxUtil.getResponseFn(res));
});

router.delete('/notifications', (req, res, next) => {
  notificationService.clearNotifications(req.query, ajaxUtil.getResponseFn(res));
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
