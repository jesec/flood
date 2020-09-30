import express from 'express';

import ajaxUtil from '../../util/ajaxUtil';

const router = express.Router();

router.get('/', (req, res) => {
  req.services?.feedService.getAll(ajaxUtil.getResponseFn(res));
});

router.delete('/:id', (req, res) => {
  req.services?.feedService.removeItem(req.params.id, ajaxUtil.getResponseFn(res));
});

router.get('/feeds', (req, res) => {
  req.services?.feedService.getFeeds(req.params.query, ajaxUtil.getResponseFn(res));
});

router.put('/feeds', (req, res) => {
  req.services?.feedService.addFeed(req.body, ajaxUtil.getResponseFn(res));
});

router.put('/feeds/:id', (req, res) => {
  req.services?.feedService.modifyFeed(req.params.id, req.body, ajaxUtil.getResponseFn(res));
});

router.get('/rules', (req, res) => {
  req.services?.feedService.getRules(req.params.query, ajaxUtil.getResponseFn(res));
});

router.put('/rules', (req, res) => {
  req.services?.feedService.addRule(req.body, ajaxUtil.getResponseFn(res));
});

router.get('/items', (req, res) => {
  req.services?.feedService.getItems(req.query, ajaxUtil.getResponseFn(res));
});

export default router;
