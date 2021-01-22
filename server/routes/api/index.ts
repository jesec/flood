import express from 'express';
import passport from 'passport';
import rateLimit from 'express-rate-limit';

import {contentTokenSchema} from '@shared/schema/api/torrents';

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
import {getAuthToken, verifyToken} from '../../util/authUtil';
import {getDirectoryList} from '../../util/fileUtil';
import {getResponseFn} from '../../util/ajaxUtil';
import torrentsRoutes from './torrents';

const router = express.Router();

router.use('/auth', authRoutes);

// Special routes that may bypass authentication when conditions matched

/**
 * GET /api/torrents/{hash}/contents/{indices}/data
 * @summary Gets downloaded data of contents of a torrent. Allows unauthenticated
 *          access if a valid content token is found in the query.
 * @see torrents.ts
 */
router.get<{hash: string; indices: string}, unknown, unknown, {token: string}>(
  '/torrents/:hash/contents/:indices/data',
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
  }),
  async (req, _res, next) => {
    const {token} = req.query;

    if (typeof token === 'string' && token !== '') {
      const payload = await verifyToken(token).catch(() => undefined);

      if (payload != null) {
        const parsedResult = contentTokenSchema.safeParse(payload);

        if (parsedResult.success) {
          const {username, hash: authorizedHash, indices: authorizedIndices, iat} = parsedResult.data;

          if (
            typeof username === 'string' &&
            typeof authorizedHash === 'string' &&
            typeof authorizedIndices === 'string'
          ) {
            const {hash: requestedHash, indices: requestedIndices} = req.params;

            if (requestedHash === authorizedHash && requestedIndices === authorizedIndices) {
              req.cookies = {jwt: getAuthToken(username, iat)};
            }
          }
        }
      }
    }

    next();
  },
);

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

/**
 * GET /api/history
 * @summary Gets transfer history in the given interval
 * @tags Flood
 * @security User
 * @param {HistorySnapshot} snapshot.query - interval
 * @return {TransferHistory} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get<unknown, unknown, unknown, {snapshot: HistorySnapshot}>('/history', (req, res) => {
  req.services?.historyService.getHistory(req.query).then(
    (snapshot) => {
      res.json(snapshot);
    },
    (err) => {
      res.status(500).json(err);
    },
  );
});

/**
 * GET /api/notifications
 * @summary Gets notifications
 * @tags Flood
 * @security User
 * @param {NotificationFetchOptions} queries - options
 * @return {{Notification[][], NotificationCount}} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get<unknown, unknown, unknown, NotificationFetchOptions>('/notifications', (req, res) => {
  req.services?.notificationService.getNotifications(req.query).then(
    (notifications) => {
      res.status(200).json(notifications);
    },
    (err: Error) => {
      res.status(500).json({message: err.message});
    },
  );
});

/**
 * DELETE /api/notifications
 * @summary Clears notifications
 * @tags Flood
 * @security User
 * @return 200 - success response
 * @return {Error} 500 - failure response - application/json
 */
router.delete('/notifications', (req, res) => {
  req.services?.notificationService.clearNotifications().then(
    () => {
      res.status(200).send();
    },
    (err: Error) => {
      res.status(500).json({message: err.message});
    },
  );
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
