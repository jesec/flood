import express from 'express';

import {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  CheckTorrentsOptions,
  DeleteTorrentsOptions,
  MoveTorrentsOptions,
  SetTorrentContentsPropertiesOptions,
  SetTorrentsPriorityOptions,
  SetTorrentsTagsOptions,
  StartTorrentsOptions,
  StopTorrentsOptions,
} from '@shared/types/Action';

import ajaxUtil from '../../util/ajaxUtil';
import client from '../../models/client';
import mediainfo from '../../util/mediainfo';
import settings from '../../models/settings';

const router = express.Router();

/**
 * POST /api/torrents/add-urls
 * @summary Adds torrents by URLs.
 * @tags Torrents
 * @security AuthenticatedUser
 * @param {AddTorrentByURLOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, AddTorrentByURLOptions>('/add-urls', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .addTorrentsByURL(req.body)
    .then((response) => {
      if (req.user != null) {
        settings.set(req.user, [{id: 'startTorrentsOnLoad', data: req.body.start === true}]);
      }
      req.services?.torrentService.fetchTorrentList();
      return response;
    })
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

/**
 * POST /api/torrents/add-files
 * @summary Adds torrents by files.
 * @tags Torrents
 * @security AuthenticatedUser
 * @param {AddTorrentByFileOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, AddTorrentByFileOptions>('/add-files', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .addTorrentsByFile(req.body)
    .then((response) => {
      if (req.user != null) {
        settings.set(req.user, [{id: 'startTorrentsOnLoad', data: req.body.start === true}]);
      }
      req.services?.torrentService.fetchTorrentList();
      return response;
    })
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

/**
 * POST /api/torrents/start
 * @summary Starts torrents.
 * @tags Torrents
 * @security AuthenticatedUser
 * @param {StartTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, StartTorrentsOptions>('/start', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .startTorrents(req.body)
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
 * POST /api/torrents/stop
 * @summary Stops torrents.
 * @tags Torrents
 * @security AuthenticatedUser
 * @param {StopTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, StopTorrentsOptions>('/stop', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .stopTorrents(req.body)
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
 * POST /api/torrents/check-hash
 * @summary Hash checks torrents.
 * @tags Torrents
 * @security AuthenticatedUser
 * @param {CheckTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, CheckTorrentsOptions>('/check-hash', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .checkTorrents(req.body)
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
 * POST /api/torrents/move
 * @summary Moves torrents to specified destination path.
 * @tags Torrents
 * @security AuthenticatedUser
 * @param {MoveTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, MoveTorrentsOptions>('/move', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .moveTorrents(req.body)
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
 * POST /api/torrents/delete
 * @summary Removes torrents from Flood. Optionally deletes data of torrents.
 * @tags Torrents
 * @security AuthenticatedUser
 * @param {DeleteTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, DeleteTorrentsOptions>('/delete', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .removeTorrents(req.body)
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
 * PATCH /api/torrents/priority
 * @summary Sets priority of torrents.
 * @tags Torrent
 * @security AuthenticatedUser
 * @param {SetTorrentsPriorityOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<unknown, unknown, SetTorrentsPriorityOptions>('/priority', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .setTorrentsPriority(req.body)
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
 * PATCH /api/torrents/tags
 * @summary Sets tags of torrents.
 * @tags Torrents
 * @security AuthenticatedUser
 * @param {SetTorrentsTagsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<unknown, unknown, SetTorrentsTagsOptions>('/tags', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .setTorrentsTags(req.body)
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
 * PATCH /api/torrents/tracker
 * @summary Sets tracker of torrents.
 * @tags Torrents
 * @security AuthenticatedUser
 */
router.patch('/tracker', (req, res) => {
  client.setTracker(req.user, req.services, req.body, ajaxUtil.getResponseFn(res));
});

/**
 *
 * APIs below operate on a single torrent.
 *
 */

/**
 * TODO: API not yet implemented
 * GET /api/torrents/{hash}
 * @summary Gets information of a torrent.
 * @tags Torrent
 * @security AuthenticatedUser
 * @param {string} hash.path - Hash of a torrent
 */

/**
 * TODO: API not yet implemented
 * GET /api/torrents/{hash}/contents
 * @summary Gets the list of contents of a torrent and their properties.
 * @tags Torrent
 * @security AuthenticatedUser
 * @param {string} hash.path
 */

/**
 * PATCH /api/torrents/{hash}/contents
 * @summary Sets properties of contents of a torrent. Only priority can be set for now.
 * @tags Torrent
 * @security AuthenticatedUser
 * @param {string} hash.path
 * @param {SetTorrentContentsPropertiesOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<{hash: string}, unknown, SetTorrentContentsPropertiesOptions>('/:hash/contents', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    .setTorrentContentsPriority(req.params.hash, req.body)
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

/**
 * GET /api/torrents/{hash}/contents/{indices}/data
 * @summary Gets downloaded data of contents of a torrent.
 * @tags Torrent
 * @security AuthenticatedUser
 * @param {string} hash.path
 * @param {string} indices.path - 'all' or indices of selected contents separated by ','
 * @return {object} 200 - contents archived in .tar - application/x-tar
 */
router.get('/:hash/contents/:indices/data', (req, res) => {
  client.downloadFiles(req.services, req.params.hash, req.params.indices, res);
});

/**
 * TODO: Split to /peers, /trackers and /contents endpoints
 * GET /api/torrents/{hash}/details
 * @summary Gets details of a torrent.
 * @tags Torrent
 * @security AuthenticatedUser
 * @param {string} hash.path
 */
router.get('/:hash/details', (req, res) => {
  client.getTorrentDetails(req.user, req.services, req.params.hash, ajaxUtil.getResponseFn(res));
});

/**
 * GET /api/torrents/{hash}/mediainfo
 * @summary Gets mediainfo output of a torrent.
 * @tags Torrent
 * @security AuthenticatedUser
 * @param {string} hash.path
 */
router.get('/:hash/mediainfo', (req, res) => {
  mediainfo.getMediainfo(req.services, req.params.hash, ajaxUtil.getResponseFn(res));
});

export default router;
