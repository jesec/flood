import express, {Response} from 'express';
import fs from 'fs';
import passport from 'passport';
import path from 'path';
import rateLimit from 'express-rate-limit';

import {contentTokenSchema} from '@shared/schema/api/torrents';

import type {FloodSettings} from '@shared/types/FloodSettings';
import type {HistorySnapshot} from '@shared/constants/historySnapshotTypes';
import type {NotificationFetchOptions} from '@shared/types/Notification';
import type {SetFloodSettingsOptions} from '@shared/types/api/index';
import type {RequestHandler} from 'express';

import {accessDeniedError, isAllowedPath, sanitizePath} from '../../util/fileUtil';
import appendUserServices from '../../middleware/appendUserServices';
import authRoutes from './auth';
import clientRoutes from './client';
import clientActivityStream from '../../middleware/clientActivityStream';
import eventStream from '../../middleware/eventStream';
import feedMonitorRoutes from './feed-monitor';
import {getAuthToken, verifyToken} from '../../util/authUtil';
import torrentsRoutes from './torrents';

const router = express.Router();

router.use('/auth', authRoutes);

// Special routes that may bypass authentication when conditions matched

const authenticateContentRequest: RequestHandler = async (req, _res, next) => {
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
};

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
  authenticateContentRequest,
);

/**
 * GET /api/torrents/{hash}/contents/{index}/subtitles
 * @summary Extracts subtitle data from the downloaded contents of a torrent. Allows unauthenticated
 *          access if a valid content token is found in the query.
 * @see torrents.ts
 */
router.get<{hash: string; index: string}, unknown, unknown, {token: string}>(
  '/torrents/:hash/contents/:indices/subtitles',
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
  }),
  authenticateContentRequest,
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

/**
 * GET /api/directory-list
 * @summary Lists a directory
 * @tags Flood
 * @security User
 * @return {object} 200 - success response - application/json
 * @return {Error} 403 - access denied - application/json
 * @return {Error} 404 - entity not found - application/json
 * @return {Error} 422 - invalid argument - application/json
 * @return {Error} 500 - other errors - application/json
 */
router.get<unknown, unknown, unknown, {path: string}>(
  '/directory-list',
  (req, res): Response<unknown> => {
    const {path: inputPath} = req.query;

    if (typeof inputPath !== 'string' || !inputPath) {
      return res.status(422).json({code: 'EINVAL', message: 'Invalid argument'});
    }

    const resolvedPath = sanitizePath(inputPath);
    if (!isAllowedPath(resolvedPath)) {
      const {code, message} = accessDeniedError();
      return res.status(403).json({code, message});
    }

    const directories: Array<string> = [];
    const files: Array<string> = [];

    try {
      fs.readdirSync(resolvedPath, {withFileTypes: true}).forEach((dirent) => {
        if (dirent.isDirectory()) {
          directories.push(dirent.name);
        } else if (dirent.isFile()) {
          files.push(dirent.name);
        } else if (dirent.isSymbolicLink()) {
          try {
            const stats = fs.statSync(path.join(resolvedPath, dirent.name));
            if (stats.isDirectory()) {
              directories.push(dirent.name);
            } else if (stats.isFile()) {
              files.push(dirent.name);
            }
          } catch {
            // do nothing.
          }
        }
      });
    } catch (e) {
      const {code, message} = e as NodeJS.ErrnoException;
      if (code === 'ENOENT') {
        return res.status(404).json({code, message});
      } else if (code === 'EACCES') {
        return res.status(403).json({code, message});
      } else {
        return res.status(500).json({code, message});
      }
    }

    return res.status(200).json({
      path: resolvedPath,
      separator: path.sep,
      directories,
      files,
    });
  },
);

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
  req.services.historyService.getHistory(req.query).then(
    (snapshot) => {
      res.json(snapshot);
    },
    ({code, message}) => {
      res.status(500).json({code, message});
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
  req.services.notificationService.getNotifications(req.query).then(
    (notifications) => {
      res.status(200).json(notifications);
    },
    ({code, message}) => {
      res.status(500).json({code, message});
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
  req.services.notificationService.clearNotifications().then(
    () => {
      res.status(200).send();
    },
    ({code, message}) => {
      res.status(500).json({code, message});
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
router.get(
  '/settings',
  async (req, res): Promise<Response> =>
    req.services.settingService.get(null).then(
      (settings) => res.status(200).json(settings),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * GET /api/settings/{property}
 * @summary Gets Flood's settings
 * @tags Flood
 * @security User
 * @param property.path
 * @return {Partial<FloodSettings>} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get<{property: keyof FloodSettings}>(
  '/settings/:property',
  async (req, res): Promise<Response> =>
    req.services.settingService.get(req.params.property).then(
      (setting) => res.status(200).json(setting),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * PATCH /api/settings
 * @summary Sets Flood's settings
 * @tags Flood
 * @security User
 * @param {Partial<FloodSettings>} request.body.required - options - application/json
 * @return {Partial<FloodSettings>} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<unknown, unknown, SetFloodSettingsOptions>(
  '/settings',
  async (req, res): Promise<Response> =>
    req.services.settingService.set(req.body).then(
      (savedSettings) => res.status(200).json(savedSettings),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

export default router;
