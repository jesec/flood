import express, {Response} from 'express';

import type {AddWatchOptions, ModifyWatchOptions} from '@shared/types/api/watch-monitor';

const router = express.Router();

/**
 * GET /api/watch-monitor
 * @summary Gets watched directories and their stats
 * @tags Watch
 * @security User
 * @return {{watches: Array<WatchedDirectory>}} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get(
  '/',
  async (req, res): Promise<Response> =>
    req.services.watchService.getAll().then(
      (watches) => res.status(200).json(watches),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * GET /api/watch-monitor/{id?}
 * @summary Gets subscribed feeds
 * @tags Feeds
 * @security User
 * @param id.path.optional - Unique ID of the watch subscription
 * @return {Array<Feed>}} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get<{id: string}>(
  '/:id?',
  async (req, res): Promise<Response> =>
    req.services.watchService.getWatch(req.params.id).then(
      (watch) => res.status(200).json(watch),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * PUT /api/watch-monitor
 * @summary Subscribes to a watch
 * @tags watch
 * @security User
 * @param {AddWatchOptions} request.body.required - options - application/json
 * @return {Feed} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.put<unknown, unknown, AddWatchOptions>(
  '/',
  async (req, res): Promise<Response> =>
    req.services.watchService.addWatch(req.body).then(
      (feed) => res.status(200).json(feed),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * PATCH /api/watch-monitor/{id}
 * @summary Modifies the options of a feed subscription
 * @tags Feeds
 * @security User
 * @param id.path - Unique ID of the feed subscription
 * @param {ModifyWatchOptions} request.body.required - options - application/json
 * @return {} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<{id: string}, unknown, ModifyWatchOptions>(
  '/:id',
  async (req, res): Promise<Response> =>
    req.services.watchService.modifyWatch(req.params.id, req.body).then(
      (response) => res.status(200).json(response),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * DELETE /api/watch-monitor/{id}
 * @summary Deletes watch subscription
 * @tags Watch
 * @security User
 * @param id.path - Unique ID of the item
 * @return {} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.delete<{id: string}>(
  '/:id',
  async (req, res): Promise<Response> =>
    req.services.watchService.removeItem(req.params.id).then(
      (response) => res.status(200).json(response),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

export default router;
