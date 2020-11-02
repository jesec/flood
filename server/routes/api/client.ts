import express from 'express';

import type {ClientSettings} from '@shared/types/ClientSettings';
import type {SetClientSettingsOptions} from '@shared/types/api/client';

import ajaxUtil from '../../util/ajaxUtil';
import requireAdmin from '../../middleware/requireAdmin';

// Those settings don't require administrator access.
const SAFE_CLIENT_SETTINGS: Array<keyof ClientSettings> = ['throttleGlobalDownMax', 'throttleGlobalUpMax'];

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
    ?.testGateway()
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
 * @security User
 * @return {ClientSettings} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get('/settings', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    ?.getClientSettings()
    .then(callback)
    .catch((e) => callback(null, e));
});

/**
 * PATCH /api/client/settings
 * @summary Sets settings of torrent client managed by Flood.
 * @tags Client
 * @security User - safe settings
 * @security Administrator - sensitive settings
 * @param {SetClientSettingsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch('/settings', (req, res, next) => {
  if (
    Object.keys(req.body).some((key) => {
      return !SAFE_CLIENT_SETTINGS.includes(key as keyof ClientSettings);
    })
  ) {
    // Some settings are sensitive (e.g. can open undesired ports on the instance or make the
    // instance send unsanctioned requests to another machine). So administrator access is required.
    requireAdmin(req, res, next);
  } else {
    next();
  }
});
router.patch<unknown, unknown, SetClientSettingsOptions>('/settings', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    ?.setClientSettings(req.body)
    .then(callback)
    .catch((e) => callback(null, e));
});

export default router;
