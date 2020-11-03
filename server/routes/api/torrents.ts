import childProcess from 'child_process';
import createTorrent from 'create-torrent';
import express from 'express';
import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
import tar from 'tar';

import {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  CheckTorrentsOptions,
  CreateTorrentOptions,
  DeleteTorrentsOptions,
  MoveTorrentsOptions,
  SetTorrentContentsPropertiesOptions,
  SetTorrentsPriorityOptions,
  SetTorrentsTagsOptions,
  SetTorrentsTrackersOptions,
  StartTorrentsOptions,
  StopTorrentsOptions,
} from '@shared/types/api/torrents';

import {accessDeniedError, isAllowedPath, sanitizePath} from '../../util/fileUtil';
import ajaxUtil from '../../util/ajaxUtil';
import {getTempPath} from '../../models/TemporaryStorage';

const router = express.Router();

/**
 * GET /api/torrents
 * @summary Gets the list of torrents
 * @tags Torrents
 * @security User
 * @return {TorrentListSummary} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get('/', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.torrentService
    .fetchTorrentList()
    .then((data) => {
      if (data == null) {
        callback(null, new Error());
      } else {
        callback(data);
      }
    })
    .catch((err) => {
      callback(null, err);
    });
});

/**
 * POST /api/torrents/add-urls
 * @summary Adds torrents by URLs.
 * @tags Torrents
 * @security User
 * @param {AddTorrentByURLOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, AddTorrentByURLOptions>('/add-urls', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  let sanitizedPath: string | null = null;
  try {
    sanitizedPath = sanitizePath(req.body.destination);
    if (!isAllowedPath(sanitizedPath)) {
      callback(null, accessDeniedError());
      return;
    }
  } catch (e) {
    callback(null, e);
    return;
  }

  req.services?.clientGatewayService
    ?.addTorrentsByURL({...req.body, destination: sanitizedPath})
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
 * POST /api/torrents/add-files
 * @summary Adds torrents by files.
 * @tags Torrents
 * @security User
 * @param {AddTorrentByFileOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, AddTorrentByFileOptions>('/add-files', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  let sanitizedPath: string | null = null;
  try {
    sanitizedPath = sanitizePath(req.body.destination);
    if (!isAllowedPath(sanitizedPath)) {
      callback(null, accessDeniedError());
      return;
    }
  } catch (e) {
    callback(null, e);
    return;
  }

  req.services?.clientGatewayService
    ?.addTorrentsByFile({...req.body, destination: sanitizedPath})
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
 * POST /api/torrents/create
 * @summary Creates a torrent
 * @tags Torrents
 * @security User
 * @param {CreateTorrentOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/x-bittorrent
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, CreateTorrentOptions>('/create', async (req, res) => {
  const {name, sourcePath, trackers, comment, infoSource, isPrivate, tags, start} = req.body;
  const callback = ajaxUtil.getResponseFn(res);

  if (typeof sourcePath !== 'string') {
    callback(null, accessDeniedError());
    return;
  }

  const sanitizedPath = sanitizePath(sourcePath);
  if (!isAllowedPath(sanitizedPath)) {
    callback(null, accessDeniedError());
    return;
  }

  const torrentFileName = sanitize(name || sanitizedPath.split(path.sep).pop() || `${Date.now()}`).concat('.torrent');
  const torrentPath = getTempPath(torrentFileName);

  createTorrent(
    sanitizedPath,
    {
      name,
      comment,
      createdBy: 'Flood - flood.js.org',
      private: isPrivate,
      announceList: [trackers],
      info: infoSource
        ? {
            source: infoSource,
          }
        : undefined,
    },
    (err, torrent) => {
      if (err) {
        callback(null, err);
        return;
      }

      fs.writeFile(torrentPath, torrent, (writeErr) => {
        if (writeErr) {
          callback(null, writeErr);
          return;
        }

        res.attachment(torrentFileName);
        res.download(torrentPath);

        req.services?.clientGatewayService
          ?.addTorrentsByFile({
            files: [torrent.toString('base64')],
            destination: fs.lstatSync(sanitizedPath).isDirectory() ? sanitizedPath : path.dirname(sanitizedPath),
            tags,
            isBasePath: true,
            isCompleted: true,
            start: start || false,
          })
          .catch(() => {
            // do nothing.
          });
      });
    },
  );
});

/**
 * POST /api/torrents/start
 * @summary Starts torrents.
 * @tags Torrents
 * @security User
 * @param {StartTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, StartTorrentsOptions>('/start', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    ?.startTorrents(req.body)
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
 * @security User
 * @param {StopTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, StopTorrentsOptions>('/stop', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    ?.stopTorrents(req.body)
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
 * @security User
 * @param {CheckTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, CheckTorrentsOptions>('/check-hash', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    ?.checkTorrents(req.body)
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
 * @security User
 * @param {MoveTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, MoveTorrentsOptions>('/move', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  let sanitizedPath: string | null = null;
  try {
    sanitizedPath = sanitizePath(req.body.destination);
    if (!isAllowedPath(sanitizedPath)) {
      callback(null, accessDeniedError());
      return;
    }
  } catch (e) {
    callback(null, e);
    return;
  }

  req.services?.clientGatewayService
    ?.moveTorrents({...req.body, destination: sanitizedPath})
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
 * @security User
 * @param {DeleteTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, DeleteTorrentsOptions>('/delete', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    ?.removeTorrents(req.body)
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
 * @security User
 * @param {SetTorrentsPriorityOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<unknown, unknown, SetTorrentsPriorityOptions>('/priority', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    ?.setTorrentsPriority(req.body)
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
 * @security User
 * @param {SetTorrentsTagsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<unknown, unknown, SetTorrentsTagsOptions>('/tags', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    ?.setTorrentsTags(req.body)
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
 * PATCH /api/torrents/trackers
 * @summary Sets trackers of torrents.
 * @tags Torrents
 * @security User
 * @param {SetTorrentsTrackersOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<unknown, unknown, SetTorrentsTrackersOptions>('/trackers', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    ?.setTorrentsTrackers(req.body)
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
 *
 * APIs below operate on a single torrent.
 *
 */

/**
 * TODO: API not yet implemented
 * GET /api/torrents/{hash}
 * @summary Gets information of a torrent.
 * @tags Torrent
 * @security User
 * @param {string} hash.path - Hash of a torrent
 */

/**
 * GET /api/torrents/{hash}/contents
 * @summary Gets the list of contents of a torrent and their properties.
 * @tags Torrent
 * @security User
 * @param {string} hash.path
 */
router.get('/:hash/contents', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    ?.getTorrentContents(req.params.hash)
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

/**
 * PATCH /api/torrents/{hash}/contents
 * @summary Sets properties of contents of a torrent. Only priority can be set for now.
 * @tags Torrent
 * @security User
 * @param {string} hash.path
 * @param {SetTorrentContentsPropertiesOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<{hash: string}, unknown, SetTorrentContentsPropertiesOptions>('/:hash/contents', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    ?.setTorrentContentsPriority(req.params.hash, req.body)
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

/**
 * GET /api/torrents/{hash}/contents/{indices}/data
 * @summary Gets downloaded data of contents of a torrent.
 * @tags Torrent
 * @security User
 * @param {string} hash.path
 * @param {string} indices.path - 'all' or indices of selected contents separated by ','
 * @return {object} 200 - contents archived in .tar - application/x-tar
 */
router.get('/:hash/contents/:indices/data', (req, res) => {
  const {hash, indices: stringIndices} = req.params;
  try {
    const selectedTorrent = req.services?.torrentService.getTorrent(hash);
    if (!selectedTorrent) return res.status(404).json({error: 'Torrent not found.'});

    return req.services?.clientGatewayService?.getTorrentContents(hash).then((contents) => {
      if (!contents) return res.status(404).json({error: 'Torrent contents not found'});

      let indices: Array<number>;
      if (!stringIndices || stringIndices === 'all') {
        indices = contents.map((x) => x.index);
      } else {
        indices = stringIndices.split(',').map((value) => Number(value));
      }

      const filePathsToDownload = contents
        .filter((content) => indices.includes(content.index))
        .map((content) => {
          return sanitizePath(path.join(selectedTorrent.directory, content.path));
        })
        .filter((filePath) => isAllowedPath(filePath));

      if (filePathsToDownload.length === 1) {
        const file = filePathsToDownload[0];
        if (!fs.existsSync(file)) return res.status(404).json({error: 'File not found.'});

        res.attachment(path.basename(file));
        return res.download(file);
      }

      const archiveRootFolder = sanitizePath(selectedTorrent.directory);
      const relativeFilePaths = filePathsToDownload.map((filePath) =>
        filePath.replace(`${archiveRootFolder}${path.sep}`, ''),
      );

      res.attachment(`${selectedTorrent.name}.tar`);
      return tar
        .c({cwd: archiveRootFolder, follow: false, noDirRecurse: true, portable: true}, relativeFilePaths)
        .pipe(res);
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

/**
 * GET /api/torrents/{hash}/details
 * @summary Gets details of a torrent.
 * @tags Torrent
 * @security User
 * @param {string} hash.path
 */
router.get('/:hash/details', async (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  try {
    const contents = req.services?.clientGatewayService?.getTorrentContents(req.params.hash);
    const peers = req.services?.clientGatewayService?.getTorrentPeers(req.params.hash);
    const trackers = req.services?.clientGatewayService?.getTorrentTrackers(req.params.hash);

    callback({
      contents: await contents,
      peers: await peers,
      trackers: await trackers,
    });
  } catch (e) {
    callback(null, e);
  }
});

/**
 * GET /api/torrents/{hash}/mediainfo
 * @summary Gets mediainfo output of a torrent.
 * @tags Torrent
 * @security User
 * @param {string} hash.path
 * @return {{output: string}} - 200 - success response - application/json
 */
router.get('/:hash/mediainfo', async (req, res) => {
  const {hash} = req.params;
  const callback = ajaxUtil.getResponseFn(res);
  const {torrentService} = req.services || {};

  if (typeof hash !== 'string' || torrentService == null) {
    callback(null, new Error());
    return;
  }

  const {directory, name} = torrentService.getTorrent(hash);

  if (directory == null || name == null) {
    callback(null, new Error());
    return;
  }

  const contentPath = fs.existsSync(path.join(directory, name)) ? path.join(directory, name) : directory;

  try {
    const mediainfoProcess = childProcess.execFile(
      'mediainfo',
      [contentPath],
      {maxBuffer: 1024 * 2000},
      (error, stdout, stderr) => {
        if (error) {
          callback(null, error);
          return;
        }

        if (stderr) {
          callback(null, Error(stderr));
          return;
        }

        callback({output: stdout});
      },
    );
    req.on('close', () => mediainfoProcess.kill('SIGTERM'));
  } catch (childProcessError) {
    callback(null, Error(childProcessError));
  }
});

/**
 * GET /api/torrents/{hash}/peers
 * @summary Gets the list of peers of a torrent.
 * @tags Torrent
 * @security User
 * @param {string} hash.path
 */
router.get('/:hash/peers', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    ?.getTorrentPeers(req.params.hash)
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

/**
 * GET /api/torrents/{hash}/trackers
 * @summary Gets the list of trackers of a torrent.
 * @tags Torrent
 * @security User
 * @param {string} hash.path
 * @return {Array<TorrentTracker>} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get('/:hash/trackers', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);

  req.services?.clientGatewayService
    ?.getTorrentTrackers(req.params.hash)
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

export default router;
