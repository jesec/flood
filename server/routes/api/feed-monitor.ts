import express from 'express';

import type {AddFeedOptions, AddRuleOptions, ModifyFeedOptions} from '@shared/types/api/feed-monitor';

import ajaxUtil from '../../util/ajaxUtil';

const router = express.Router();

/**
 * GET /api/feed-monitor
 * @summary Gets subscribed feeds and their automation rules
 * @tags Feeds
 * @security User
 * @return {{feeds: Array<Feed>; rules: Array<Rule>}} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get('/', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.feedService
    .getAll()
    .then((feedsAndRules) => {
      callback(feedsAndRules);
    })
    .catch((error) => {
      callback(null, error);
    });
});

/**
 * DELETE /api/feed-monitor/{id}
 * @summary Deletes feed subscription or automation rule
 * @tags Feeds
 * @security User
 * @param id.path - Unique ID of the item
 * @return {} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.delete<{id: string}>('/:id', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.feedService
    .removeItem(req.params.id)
    .then(() => {
      callback(null);
    })
    .catch((error) => {
      callback(null, error);
    });
});

/**
 * GET /api/feed-monitor/feeds
 * @summary Gets subscribed feeds
 * @tags Feeds
 * @security User
 * @return {Array<Feed>}} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get('/feeds', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.feedService
    .getFeeds()
    .then((feeds) => {
      callback(feeds);
    })
    .catch((error) => {
      callback(null, error);
    });
});

/**
 * PUT /api/feed-monitor/feeds
 * @summary Subscribes to a feed
 * @tags Feeds
 * @security User
 * @param {AddFeedOptions} request.body.required - options - application/json
 * @return {Feed} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.put<unknown, unknown, AddFeedOptions>('/feeds', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.feedService
    .addFeed(req.body)
    .then((feed) => {
      callback(feed);
    })
    .catch((error) => {
      callback(null, error);
    });
});

/**
 * PUT /api/feed-monitor/feeds/{id}
 * @summary Modifies the options of a feed subscription
 * @tags Feeds
 * @security User
 * @param id.path - Unique ID of the feed subscription
 * @param {ModifyFeedOptions} request.body.required - options - application/json
 * @return {} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.put<{id: string}, unknown, ModifyFeedOptions>('/feeds/:id', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.feedService
    .modifyFeed(req.params.id, req.body)
    .then(() => {
      callback(null);
    })
    .catch((error) => {
      callback(null, error);
    });
});

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
router.get<{id: string}, unknown, ModifyFeedOptions, {search: string}>('/feeds/:id/items', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.feedService
    .getItems(req.params.id, req.query.search)
    .then((items) => {
      callback(items);
    })
    .catch((error) => {
      callback(null, error);
    });
});

/**
 * GET /api/feed-monitor/rules
 * @summary Gets automation rules
 * @tags Feeds
 * @security User
 * @return {Array<Rule>}} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get('/rules', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.feedService
    .getRules()
    .then((rules) => {
      callback(rules);
    })
    .catch((error) => {
      callback(null, error);
    });
});

/**
 * PUT /api/feed-monitor/rules
 * @summary Adds an automation rule to a feed subscription
 * @tags Feeds
 * @security User
 * @param {AddRuleOptions} request.body.required - options - application/json
 * @return {Rule} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.put<unknown, unknown, AddRuleOptions>('/rules', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.feedService
    .addRule(req.body)
    .then(() => {
      callback(null);
    })
    .catch((error) => {
      callback(null, error);
    });
});

export default router;
