import express from 'express';
import multer from 'multer';

import type {
  CheckTorrentsOptions,
  DeleteTorrentsOptions,
  MoveTorrentsOptions,
  StartTorrentsOptions,
  StopTorrentsOptions,
} from '@shared/types/Action';

import ajaxUtil from '../util/ajaxUtil';
import booleanCoerce from '../middleware/booleanCoerce';
import client from '../models/client';

const router = express.Router();

const upload = multer({
  dest: 'uploads/',
  limits: {fileSize: 10000000},
  storage: multer.memoryStorage(),
});

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

router.post('/add', (req, res) => {
  client.addUrls(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

router.post('/add-files', upload.array('torrents'), booleanCoerce('isBasePath'), (req, res) => {
  client.addFiles(req.user, req.services, req, ajaxUtil.getResponseFn(res));
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

router.post('/torrent-details', (req, res) => {
  client.getTorrentDetails(req.user, req.services, req.body.hash, ajaxUtil.getResponseFn(res));
});

router.patch('/torrents/:hash/priority', (req, res) => {
  client.setPriority(req.user, req.services, req.params.hash, req.body, ajaxUtil.getResponseFn(res));
});

router.patch('/torrents/:hash/file-priority', (req, res) => {
  client.setFilePriority(req.user, req.services, req.params.hash, req.body, ajaxUtil.getResponseFn(res));
});

/**
 * POST /api/client/torrents/start
 * @summary Starts torrents.
 * @tags Torrents
 * @security AuthenticatedUser
 * @param {StartTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, StartTorrentsOptions>('/torrents/start', (req, res) => {
  const {hashes} = req.body;
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .startTorrents({hashes})
    .then((response) => {
      req.services?.torrentService.fetchTorrentList();
      return response;
    })
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

/**
 * POST /api/client/torrents/stop
 * @summary Stops torrents.
 * @tags Torrents
 * @security AuthenticatedUser
 * @param {StopTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, StopTorrentsOptions>('/torrents/stop', (req, res) => {
  const {hashes} = req.body;
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .stopTorrents({hashes})
    .then((response) => {
      req.services?.torrentService.fetchTorrentList();
      return response;
    })
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

/**
 * POST /api/client/torrents/check-hash
 * @summary Hash checks torrents.
 * @tags Torrents
 * @security AuthenticatedUser
 * @param {CheckTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, CheckTorrentsOptions>('/torrents/check-hash', (req, res) => {
  const {hashes} = req.body;
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .checkTorrents({hashes})
    .then((response) => {
      req.services?.torrentService.fetchTorrentList();
      return response;
    })
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

/**
 * POST /api/client/torrents/move
 * @summary Moves torrents to specified destination path.
 * @tags Torrents
 * @security AuthenticatedUser
 * @param {MoveTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, MoveTorrentsOptions>('/torrents/move', (req, res) => {
  const {hashes, filenames, sourcePaths, destination, moveFiles, isBasePath, isCheckHash} = req.body;
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .moveTorrents({hashes, filenames, sourcePaths, destination, moveFiles, isBasePath, isCheckHash})
    .then((response) => {
      req.services?.torrentService.fetchTorrentList();
      return response;
    })
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

/**
 * POST /api/client/torrents/delete
 * @summary Removes torrents from Flood. Optionally deletes data of torrents.
 * @tags Torrents
 * @security AuthenticatedUser
 * @param {DeleteTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, DeleteTorrentsOptions>('/torrents/delete', (req, res) => {
  const {hashes, deleteData} = req.body;
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .removeTorrents({hashes, deleteData})
    .then((response) => {
      req.services?.torrentService.fetchTorrentList();
      return response;
    })
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

router.patch('/torrents/taxonomy', (req, res) => {
  client.setTaxonomy(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

router.patch('/torrents/tracker', (req, res) => {
  client.setTracker(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

router.get('/methods.json', (req, res) => {
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
