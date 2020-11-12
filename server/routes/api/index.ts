import express from 'express';
import passport from 'passport';

import type {FloodSettings} from '@shared/types/FloodSettings';
import type {HistorySnapshot} from '@shared/constants/historySnapshotTypes';
import type {NotificationFetchOptions} from '@shared/types/Notification';
import type {SetFloodSettingsOptions} from '@shared/types/api/index';

import appendUserServices from '../../middleware/appendUserServices';
import authRoutes from './auth';
import clientRoutes from './client';
import clientActivityStream from '../../middleware/clientActivityStream';
import eventStream from '../../middleware/eventStream';
import feedMonitorRoutes from './feed-monitor';
import {getDirectoryList} from '../../util/fileUtil';
import {getResponseFn} from '../../util/ajaxUtil';
import torrentsRoutes from './torrents';

const router = express.Router();

router.use('/auth', authRoutes);

// All subsequent routes need authentication
router.use('/', passport.authenticate('jwt', {session: false}), appendUserServices);

router.use('/client', clientRoutes);

router.use('/feed-monitor', feedMonitorRoutes);

router.use('/torrents', torrentsRoutes);

/**
 * GET /api/activity-stream
 * @summary Subscribes to activity stream
 * @tags Flood
 * @security User
 * @return {EventSource<ServerEvent>} 200 - success response - text/event-stream
 * @return {Error} 500 - failure response - application/json
 */
router.get('/activity-stream', eventStream, clientActivityStream);

router.get<unknown, unknown, unknown, {path: string}>('/directory-list', (req, res) => {
  const callback = getResponseFn(res);
  getDirectoryList(req.query.path)
    .then((data) => {
      callback(data);
    })
    .catch((error) => {
      callback(null, error);
    });
});

router.get<unknown, unknown, unknown, {snapshot: HistorySnapshot}>('/history', (req, res) => {
  req.services?.historyService.getHistory(req.query, getResponseFn(res));
});

router.get<unknown, unknown, unknown, NotificationFetchOptions>('/notifications', (req, res) => {
  req.services?.notificationService.getNotifications(req.query, getResponseFn(res));
});

router.delete('/notifications', (req, res) => {
  req.services?.notificationService.clearNotifications(getResponseFn(res));
});

/**
 * GET /api/settings
 * @summary Gets all Flood's settings
 * @tags Flood
 * @security User
 * @return {FloodSettings} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get('/settings', (req, res) => {
  const callback = getResponseFn(res);

  req.services?.settingService
    .get(null)
    .then((settings) => {
      callback(settings as FloodSettings);
    })
    .catch((err) => {
      callback(null, err);
    });
});

/**
 * GET /api/settings/{property}
 * @summary Gets Flood's settings
 * @tags Flood
 * @security User
 * @param property.path
 * @return {Partial<FloodSettings>} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get<{property: keyof FloodSettings}>('/settings/:property', (req, res) => {
  const callback = getResponseFn(res);

  req.services?.settingService
    .get(req.params.property)
    .then((settings) => {
      callback(settings);
    })
    .catch((err) => {
      callback(null, err);
    });
});

/**
 * PATCH /api/settings
 * @summary Sets Flood's settings
 * @tags Flood
 * @security User
 * @param {Partial<FloodSettings>} request.body.required - options - application/json
 * @return {Partial<FloodSettings>} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<unknown, unknown, SetFloodSettingsOptions>('/settings', (req, res) => {
  const callback = getResponseFn(res);

  req.services?.settingService
    .set(req.body)
    .then((savedSettings) => {
      callback(savedSettings);
    })
    .catch((err) => {
      callback(null, err);
    });
});

export default router;
