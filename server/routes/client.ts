import express from 'express';

import ajaxUtil from '../util/ajaxUtil';
import client from '../models/client';

const router = express.Router();

router.get('/connection-test', (req, res) => {
  req.services?.clientGatewayService
    .testGateway()
    .then(() => {
      res.status(200).json({isConnected: true});
    })
    .catch(() => {
      res.status(500).json({isConnected: false});
    });
});

router.post('/connection-test', (req, res) => {
  req.services?.clientGatewayService
    .testGateway(req.body)
    .then(() => {
      res.status(200).json({isConnected: true});
    })
    .catch(() => {
      res.status(500).json({isConnected: false});
    });
});

router.get('/settings', (req, res) => {
  client.getSettings(req.user, req.services, req.query, ajaxUtil.getResponseFn(res));
});

router.patch('/settings', (req, res) => {
  client.setSettings(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

router.put('/settings/speed-limits', (req, res) => {
  client.setSpeedLimits(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

router.get('/rtorrent-methods', (req, res) => {
  const {type} = req.query;
  const {args} = req.query;
  let method = 'system.listMethods';

  if (type === 'help') {
    method = 'system.methodHelp';
  } else if (type === 'signature') {
    method = 'system.methodSignature';
  }

  client.listMethods(req.user, req.services, method, args, ajaxUtil.getResponseFn(res));
});

export default router;
