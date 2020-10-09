import express from 'express';
import passport from 'passport';

import type {HistorySnapshot} from '@shared/constants/historySnapshotTypes';
import type {NotificationFetchOptions} from '@shared/types/Notification';
import type {SetFloodSettingsOptions} from '@shared/types/api/index';

import appendUserServices from '../../middleware/appendUserServices';
import ajaxUtil from '../../util/ajaxUtil';
import authRoutes from './auth';
import clientRoutes from './client';
import clientActivityStream from '../../middleware/clientActivityStream';
import eventStream from '../../middleware/eventStream';
import feedMonitorRoutes from './feed-monitor';
import {getDirectoryList} from '../../util/fileUtil';
import settings from '../../models/settings';
import torrentsRoutes from './torrents';

const router = express.Router();

router.use('/auth', authRoutes);

// All subsequent routes need authentication
router.use('/', passport.authenticate('jwt', {session: false}), appendUserServices);

router.use('/client', clientRoutes);

router.use('/feed-monitor', feedMonitorRoutes);

router.use('/torrents', torrentsRoutes);

router.get('/activity-stream', eventStream, clientActivityStream);

router.get<unknown, unknown, unknown, {path: string}>('/directory-list', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);
  getDirectoryList(req.query.path)
    .then((data) => {
      callback(data);
    })
    .catch((error) => {
      callback(null, error);
    });
});

router.get<unknown, unknown, unknown, {snapshot: HistorySnapshot}>('/history', (req, res) => {
  req.services?.historyService.getHistory(req.query, ajaxUtil.getResponseFn(res));
});

router.get<unknown, unknown, unknown, NotificationFetchOptions>('/notifications', (req, res) => {
  req.services?.notificationService.getNotifications(req.query, ajaxUtil.getResponseFn(res));
});

router.delete('/notifications', (req, res) => {
  req.services?.notificationService.clearNotifications(ajaxUtil.getResponseFn(res));
});

router.get('/settings', (req, res) => {
  if (req.user == null) {
    res.status(401).json(Error('Unauthorized'));
    return;
  }
  settings.get(req.user, req.query, ajaxUtil.getResponseFn(res));
});

router.patch<unknown, unknown, SetFloodSettingsOptions>('/settings', (req, res) => {
  Promise.all(
    Object.keys(req.body).map(async (property) => {
      return {
        id: property,
        data: req.body[property as keyof typeof req.body],
      };
    }),
  ).then((settingRecords) => {
    if (req.user == null) {
      res.status(401).json(Error('Unauthorized'));
      return;
    }
    settings.set(req.user, settingRecords, ajaxUtil.getResponseFn(res));
  });
});

export default router;
