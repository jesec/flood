import type {SetClientSettingsOptions} from '@shared/types/api/client';
import type {ClientSettings} from '@shared/types/ClientSettings';
import express, {Response} from 'express';

import requireAdmin from '../../middleware/requireAdmin';

// Those settings don't require administrator access.
const SAFE_CLIENT_SETTINGS: Array<keyof ClientSettings> = ['throttleGlobalDownSpeed', 'throttleGlobalUpSpeed'];

const router = express.Router();

/**
 * GET /api/client/connection-test
 * @summary Tests connection to the torrent client
 * @tags Client
 * @security User
 * @return {{isConnected: true}} 200 - success response - application/json
 * @return {{isConnected: false}} 500 - failure response - application/json
 */
router.get(
  '/connection-test',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.testGateway().then(
      () => res.status(200).json({isConnected: true}),
      () => res.status(500).json({isConnected: false}),
    ),
);

/**
 * GET /api/client/settings
 * @summary Gets settings of torrent client managed by Flood.
 * @tags Client
 * @security User
 * @return {ClientSettings} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get(
  '/settings',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.getClientSettings().then(
      (settings) => res.status(200).json(settings),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

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

router.patch<unknown, unknown, SetClientSettingsOptions>(
  '/settings',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.setClientSettings(req.body).then(
      (response) => res.status(200).json(response),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

export default router;
