'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();

const ajaxUtil = require('../util/ajaxUtil');
const client = require('../models/client');
const clientRoutes = require('./client');
const FeedCollection = require('../models/FeedCollection');
const Filesystem = require('../models/Filesystem');
const mediainfo = require('../util/mediainfo');
const NotificationCollection = require('../models/NotificationCollection');
const history = require('../models/history');
const settings = require('../models/settings');

router.use('/', passport.authenticate('jwt', {session: false}));

router.use('/client', clientRoutes);

router.get('/download', (req, res, next) => {
  client.downloadFiles(req.query.hash, req.query.files, res);
});

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

router.get('/directory-list', (req, res, next) => {
  Filesystem.getDirectoryList(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/history', (req, res, next) => {
  history.get(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/mediainfo', (req, res, next) => {
  mediainfo.getMediainfo(req.query, ajaxUtil.getResponseFn(res));
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

module.exports = router;
