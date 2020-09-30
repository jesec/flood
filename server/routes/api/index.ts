import express from 'express';
import passport from 'passport';

import type {Request} from 'express';

import type {HistorySnapshot} from '@shared/constants/historySnapshotTypes';
import type {NotificationFetchOptions} from '@shared/types/Notification';

import appendUserServices from '../../middleware/appendUserServices';
import ajaxUtil from '../../util/ajaxUtil';
import clientRoutes from './client';
import clientActivityStream from '../../middleware/clientActivityStream';
import eventStream from '../../middleware/eventStream';
import feedMonitorRoutes from './feed-monitor';
import Filesystem from '../../models/Filesystem';
import settings from '../../models/settings';
import torrentsRoutes from './torrents';

const router = express.Router();

router.use('/', passport.authenticate('jwt', {session: false}), appendUserServices);

router.use('/client', clientRoutes);

router.use('/feed-monitor', feedMonitorRoutes);

router.use('/torrents', torrentsRoutes);

router.get('/activity-stream', eventStream, clientActivityStream);

router.get('/directory-list', (req, res) => {
  Filesystem.getDirectoryList(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/history', (req: Request<unknown, unknown, unknown, {snapshot: HistorySnapshot}>, res) => {
  req.services?.historyService.getHistory(req.query, ajaxUtil.getResponseFn(res));
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
