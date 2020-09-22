import express from 'express';
import passport from 'passport';

import type {Request} from 'express';

import type {HistorySnapshot} from '@shared/constants/historySnapshotTypes';
import type {NotificationFetchOptions} from '@shared/types/Notification';

import appendUserServices from '../middleware/appendUserServices';
import ajaxUtil from '../util/ajaxUtil';
import client from '../models/client';
import clientRoutes from './client';
import clientActivityStream from '../middleware/clientActivityStream';
import eventStream from '../middleware/eventStream';
import Filesystem from '../models/Filesystem';
import mediainfo from '../util/mediainfo';
import settings from '../models/settings';

const router = express.Router();

router.use('/', passport.authenticate('jwt', {session: false}), appendUserServices);

router.use('/client', clientRoutes);

router.get('/activity-stream', eventStream, clientActivityStream);

router.get('/download', (req, res) => {
  client.downloadFiles(req.user, req.services, req.query.hash, req.query.files, res);
});

router.delete('/feed-monitor/:id', (req, res) => {
  req.services?.feedService.removeItem(req.params.id, ajaxUtil.getResponseFn(res));
});

router.get('/feed-monitor', (req, res) => {
  req.services?.feedService.getAll(ajaxUtil.getResponseFn(res));
});

router.get('/feed-monitor/feeds', (req, res) => {
  req.services?.feedService.getFeeds(req.params.query, ajaxUtil.getResponseFn(res));
});

router.put('/feed-monitor/feeds', (req, res) => {
  req.services?.feedService.addFeed(req.body, ajaxUtil.getResponseFn(res));
});

router.put('/feed-monitor/feeds/:id', (req, res) => {
  req.services?.feedService.modifyFeed(req.params.id, req.body, ajaxUtil.getResponseFn(res));
});

router.get('/feed-monitor/rules', (req, res) => {
  req.services?.feedService.getRules(req.params.query, ajaxUtil.getResponseFn(res));
});

router.put('/feed-monitor/rules', (req, res) => {
  req.services?.feedService.addRule(req.body, ajaxUtil.getResponseFn(res));
});

router.get('/feed-monitor/items', (req, res) => {
  req.services?.feedService.getItems(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/directory-list', (req, res) => {
  Filesystem.getDirectoryList(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/history', (req: Request<unknown, unknown, unknown, {snapshot: HistorySnapshot}>, res) => {
  req.services?.historyService.getHistory(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/mediainfo', (req, res) => {
  mediainfo.getMediainfo(req.user, req.query, ajaxUtil.getResponseFn(res));
});

router.get('/notifications', (req: Request<unknown, unknown, unknown, NotificationFetchOptions>, res) => {
  req.services?.notificationService.getNotifications(req.query, ajaxUtil.getResponseFn(res));
});

router.delete('/notifications', (req, res) => {
  req.services?.notificationService.clearNotifications(ajaxUtil.getResponseFn(res));
});

router.get('/settings', (req, res) => {
  if (req.user == null) {
    res.status(500).json(Error('Unauthenticated'));
    return;
  }
  settings.get(req.user, req.query, ajaxUtil.getResponseFn(res));
});

router.patch('/settings', (req, res) => {
  if (req.user == null) {
    res.status(500).json(Error('Unauthenticated'));
    return;
  }
  settings.set(req.user, req.body, ajaxUtil.getResponseFn(res));
});

export default router;
