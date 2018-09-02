const express = require('express');
const passport = require('passport');
const router = express.Router();

const appendUserServices = require('../middleware/appendUserServices');
const ajaxUtil = require('../util/ajaxUtil');
const client = require('../models/client');
const clientRoutes = require('./client');
const clientActivityStream = require('../middleware/clientActivityStream');
const eventStream = require('../middleware/eventStream');
const Filesystem = require('../models/Filesystem');
const mediainfo = require('../util/mediainfo');
const settings = require('../models/settings');

router.use('/', passport.authenticate('jwt', {session: false}), appendUserServices);

router.use('/client', clientRoutes);

router.get('/activity-stream', eventStream, clientActivityStream);

router.get('/download', (req, res, next) => {
  client.downloadFiles(req.user, req.services, req.query.hash, req.query.files, res);
});

router.delete('/feed-monitor/:id', (req, res, next) => {
  req.services.feedService.removeItem(req.params.id, ajaxUtil.getResponseFn(res));
});

router.get('/feed-monitor', (req, res, next) => {
  req.services.feedService.getAll(req.body.query, ajaxUtil.getResponseFn(res));
});

router.get('/feed-monitor/feeds', (req, res, next) => {
  req.services.feedService.getFeeds(req.body.query, ajaxUtil.getResponseFn(res));
});

router.put('/feed-monitor/feeds', (req, res, next) => {
  req.services.feedService.addFeed(req.body, ajaxUtil.getResponseFn(res));
});

router.get('/feed-monitor/rules', (req, res, next) => {
  req.services.feedService.getRules(req.body.query, ajaxUtil.getResponseFn(res));
});

router.put('/feed-monitor/rules', (req, res, next) => {
  req.services.feedService.addRule(req.body, ajaxUtil.getResponseFn(res));
});

router.get('/directory-list', (req, res, next) => {
  Filesystem.getDirectoryList(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/history', (req, res, next) => {
  req.services.historyService.getHistory(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/mediainfo', (req, res, next) => {
  mediainfo.getMediainfo(req.user, req.query, ajaxUtil.getResponseFn(res));
});

router.get('/notifications', (req, res, next) => {
  req.services.notificationService.getNotifications(req.query, ajaxUtil.getResponseFn(res));
});

router.delete('/notifications', (req, res, next) => {
  req.services.notificationService.clearNotifications(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/settings', (req, res, next) => {
  settings.get(req.user, req.query, ajaxUtil.getResponseFn(res));
});

router.patch('/settings', (req, res, next) => {
  settings.set(req.user, req.body, ajaxUtil.getResponseFn(res));
});

module.exports = router;
