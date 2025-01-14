import type {AddFeedOptions, AddRuleOptions, ModifyFeedOptions} from '@shared/types/api/feed-monitor';
import express, {Response} from 'express';

import {accessDeniedError, isAllowedPath, sanitizePath} from '../../util/fileUtil';

const router = express.Router();

/**
 * GET /api/feed-monitor
 * @summary Gets subscribed feeds and their automation rules
 * @tags Feeds
 * @security User
 * @return {{feeds: Array<Feed>; rules: Array<Rule>}} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get(
  '/',
  async (req, res): Promise<Response> =>
    req.services.feedService.getAll().then(
      (feedsAndRules) => res.status(200).json(feedsAndRules),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * DELETE /api/feed-monitor/{id}
 * @summary Deletes feed subscription or automation rule
 * @tags Feeds
 * @security User
 * @param id.path - Unique ID of the item
 * @return {} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.delete<{id: string}>(
  '/:id',
  async (req, res): Promise<Response> =>
    req.services.feedService.removeItem(req.params.id).then(
      (response) => res.status(200).json(response),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * GET /api/feed-monitor/feeds/{id?}
 * @summary Gets subscribed feeds
 * @tags Feeds
 * @security User
 * @param id.path.optional - Unique ID of the feed subscription
 * @return {Array<Feed>}} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get<{id?: string}>(
  '/feeds/:id?',
  async (req, res): Promise<Response> =>
    req.services.feedService.getFeeds(req.params.id).then(
      (feeds) => res.status(200).json(feeds),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * PUT /api/feed-monitor/feeds
 * @summary Subscribes to a feed
 * @tags Feeds
 * @security User
 * @param {AddFeedOptions} request.body.required - options - application/json
 * @return {Feed} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.put<unknown, unknown, AddFeedOptions>(
  '/feeds',
  async (req, res): Promise<Response> =>
    req.services.feedService.addFeed(req.body).then(
      (feed) => res.status(200).json(feed),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * PATCH /api/feed-monitor/feeds/{id}
 * @summary Modifies the options of a feed subscription
 * @tags Feeds
 * @security User
 * @param id.path - Unique ID of the feed subscription
 * @param {ModifyFeedOptions} request.body.required - options - application/json
 * @return {} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<{id: string}, unknown, ModifyFeedOptions>(
  '/feeds/:id',
  async (req, res): Promise<Response> =>
    req.services.feedService.modifyFeed(req.params.id, req.body).then(
      (response) => res.status(200).json(response),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * GET /api/feed-monitor/feeds/{id}/items?search=<string>
 * @summary Gets items in a feed
 * @tags Feeds
 * @security User
 * @param id.path - Unique ID of the feed subscription
 * @param {string} search.query - string to search in items
 * @return {Array<Item>} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get<{id: string}, unknown, ModifyFeedOptions, {search: string}>(
  '/feeds/:id/items',
  async (req, res): Promise<Response> =>
    req.services.feedService.getItems(req.params.id, req.query.search).then(
      (items) => res.status(200).json(items),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * GET /api/feed-monitor/rules
 * @summary Gets automation rules
 * @tags Feeds
 * @security User
 * @return {Array<Rule>}} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get(
  '/rules',
  async (req, res): Promise<Response> =>
    req.services.feedService.getRules().then(
      (rules) => res.status(200).json(rules),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * PUT /api/feed-monitor/rules
 * @summary Adds an automation rule to a feed subscription
 * @tags Feeds
 * @security User
 * @param {AddRuleOptions} request.body.required - options - application/json
 * @return {Rule} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.put<unknown, unknown, AddRuleOptions>('/rules', async (req, res): Promise<Response> => {
  let sanitizedPath: string | null = null;
  try {
    sanitizedPath = sanitizePath(req.body.destination);
    if (!isAllowedPath(sanitizedPath)) {
      const {code, message} = accessDeniedError();
      return res.status(403).json({code, message});
    }
  } catch ({code, message}) {
    return res.status(403).json({code, message});
  }

  return req.services.feedService.addRule({...req.body, destination: sanitizedPath}).then(
    (rule) => res.status(200).json(rule),
    ({code, message}) => res.status(500).json({code, message}),
  );
});

export default router;
