import express from 'express';

import type {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import type {SetClientSettingsOptions} from '@shared/types/api/client';

import ajaxUtil from '../../util/ajaxUtil';
import client from '../../models/client';
import requireAdmin from '../../middleware/requireAdmin';

const router = express.Router();

/**
 * GET /api/client/connection-test
 * @summary Tests connection to the torrent client
 * @tags Client
 * @security User
 * @return {{isConnected: true}} 200 - success response - application/json
 * @return {{isConnected: false}} 500 - failure response - application/json
 */
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

/**
 * PUT /api/client/settings/speed-limits
 * @summary Sets speed limits of the torrent client
 * @tags Client
 * @security User
 */
router.put('/settings/speed-limits', (req, res) => {
  client.setSpeedLimits(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

// Some settings are sensitive (e.g. can open undesired ports on the instance or make the
// instance send unsanctioned requests to another machine). So administrator access is required.
// TODO: separate sensitive settings from unsensitive ones.
router.use('/', requireAdmin);

/**
 * POST /api/client/connection-test
 * @summary Tests connection to the torrent client with supplied new settings
 * @tags Client
 * @security Administrator
 * @param {ClientConnectionSettings} request.body.required - settings - application/json
 * @return {{isConnected: true}} 200 - success response - application/json
 * @return {{isConnected: false}} 500 - failure response - application/json
 */
router.post<unknown, unknown, ClientConnectionSettings>('/connection-test', (req, res) => {
  req.services?.clientGatewayService
    .testGateway(req.body)
    .then(() => {
      res.status(200).json({isConnected: true});
    })
    .catch(() => {
      res.status(500).json({isConnected: false});
    });
});

/**
 * GET /api/client/settings
 * @summary Gets settings of torrent client managed by Flood.
 * @tags Client
 * @security AuthenticatedUser
 * @return {ClientSettings} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get('/settings', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .getClientSettings()
    .then(callback)
    .catch((e) => callback(null, e));
});

/**
 * PATCH /api/client/settings
 * @summary Sets settings of torrent client managed by Flood.
 * @tags Client
 * @security AuthenticatedUser
 * @param {SetClientSettingsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<unknown, unknown, SetClientSettingsOptions>('/settings', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .setClientSettings(req.body)
    .then(callback)
    .catch((e) => callback(null, e));
});

export default router;
