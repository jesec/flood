import childProcess from 'child_process';
import contentDisposition from 'content-disposition';
import createTorrent from 'create-torrent';
import express from 'express';
import fs from 'fs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import sanitize from 'sanitize-filename';
import tar from 'tar';

import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  SetTorrentsTagsOptions,
} from '@shared/schema/api/torrents';
import type {
  CheckTorrentsOptions,
  CreateTorrentOptions,
  DeleteTorrentsOptions,
  MoveTorrentsOptions,
  SetTorrentContentsPropertiesOptions,
  SetTorrentsInitialSeedingOptions,
  SetTorrentsPriorityOptions,
  SetTorrentsSequentialOptions,
  SetTorrentsTrackersOptions,
  StartTorrentsOptions,
  StopTorrentsOptions,
} from '@shared/types/api/torrents';

import {
  addTorrentByFileSchema,
  addTorrentByURLSchema,
  setTorrentsTagsSchema,
} from '../../../shared/schema/api/torrents';
import {accessDeniedError, fileNotFoundError, isAllowedPath, sanitizePath} from '../../util/fileUtil';
import {getResponseFn, validationError} from '../../util/ajaxUtil';
import {getTempPath} from '../../models/TemporaryStorage';

const getDestination = async (
  services: Express.Request['services'],
  {destination, tags}: {destination?: string; tags?: Array<string>},
): Promise<string | undefined> => {
  let autoDestination = destination === '' ? undefined : destination;

  // Use preferred destination of the first tag
  if (autoDestination == null) {
    await services?.settingService.get('torrentDestinations').then(
      ({torrentDestinations}) => {
        autoDestination = torrentDestinations?.[tags?.[0] ?? ''];
      },
      () => undefined,
    );
  }

  // Use default destination of torrent client
  if (autoDestination == null) {
    const {directoryDefault} = (await services?.clientGatewayService?.getClientSettings().catch(() => undefined)) ?? {};
    autoDestination = directoryDefault;
  }

  // Use temporary directory of Flood
  if (autoDestination == null || typeof autoDestination !== 'string') {
    autoDestination = getTempPath('download/');
  }

  let sanitizedPath: string | null = null;
  try {
    sanitizedPath = sanitizePath(autoDestination);
    if (!isAllowedPath(sanitizedPath)) {
      return undefined;
    }
  } catch (e) {
    return undefined;
  }

  return sanitizedPath;
};

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
  const callback = getResponseFn(res);

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
router.post<unknown, unknown, AddTorrentByURLOptions>('/add-urls', async (req, res) => {
  const callback = getResponseFn(res);

  const parsedResult = addTorrentByURLSchema.safeParse(req.body);

  if (!parsedResult.success) {
    validationError(res, parsedResult.error);
    return;
  }

  const {
    urls,
    cookies,
    destination,
    tags,
    isBasePath,
    isCompleted,
    isSequential,
    isInitialSeeding,
    start,
  } = parsedResult.data;

  const finalDestination = await getDestination(req.services, {
    destination,
    tags,
  });

  if (finalDestination == null) {
    callback(null, accessDeniedError());
    return;
  }

  req.services?.clientGatewayService
    ?.addTorrentsByURL({
      urls,
      cookies: cookies != null ? cookies : {},
      destination: finalDestination,
      tags: tags ?? [],
      isBasePath: isBasePath ?? false,
      isCompleted: isCompleted ?? false,
      isSequential: isSequential ?? false,
      isInitialSeeding: isInitialSeeding ?? false,
      start: start ?? false,
    })
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
router.post<unknown, unknown, AddTorrentByFileOptions>('/add-files', async (req, res) => {
  const callback = getResponseFn(res);

  const parsedResult = addTorrentByFileSchema.safeParse(req.body);

  if (!parsedResult.success) {
    validationError(res, parsedResult.error);
    return;
  }

  const {files, destination, tags, isBasePath, isCompleted, isSequential, isInitialSeeding, start} = parsedResult.data;

  const finalDestination = await getDestination(req.services, {
    destination,
    tags,
  });

  if (finalDestination == null) {
    callback(null, accessDeniedError());
    return;
  }

  req.services?.clientGatewayService
    ?.addTorrentsByFile({
      files,
      destination: finalDestination,
      tags: tags ?? [],
      isBasePath: isBasePath ?? false,
      isCompleted: isCompleted ?? false,
      isSequential: isSequential ?? false,
      isInitialSeeding: isInitialSeeding ?? false,
      start: start ?? false,
    })
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
  const {name, sourcePath, trackers, comment, infoSource, isPrivate, isInitialSeeding, tags, start} = req.body;
  const callback = getResponseFn(res);

  if (typeof sourcePath !== 'string') {
    callback(null, accessDeniedError());
    return;
  }

  const sanitizedPath = sanitizePath(sourcePath);
  if (!isAllowedPath(sanitizedPath)) {
    callback(null, accessDeniedError());
    return;
  }

  const torrentFileName = sanitize(name ?? sanitizedPath.split(path.sep).pop() ?? `${Date.now()}`).concat('.torrent');
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

      fs.promises.writeFile(torrentPath, torrent).then(
        () => {
          res.attachment(torrentFileName);
          res.download(torrentPath);

          req.services?.clientGatewayService
            ?.addTorrentsByFile({
              files: [torrent.toString('base64')],
              destination: fs.lstatSync(sanitizedPath).isDirectory() ? sanitizedPath : path.dirname(sanitizedPath),
              tags: tags ?? [],
              isBasePath: true,
              isCompleted: true,
              isSequential: false,
              isInitialSeeding: isInitialSeeding ?? false,
              start: start ?? false,
            })
            .catch(() => {
              // do nothing.
            });
        },
        (writeErr) => {
          callback(null, writeErr);
        },
      );
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
  const callback = getResponseFn(res);

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
  const callback = getResponseFn(res);

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
  const callback = getResponseFn(res);

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
  const callback = getResponseFn(res);

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
  const callback = getResponseFn(res);

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
 * PATCH /api/torrents/initial-seeding
 * @summary Sets initial seeding mode of torrents.
 * @tags Torrent
 * @security User
 * @param {SetTorrentsInitialSeedingOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<unknown, unknown, SetTorrentsInitialSeedingOptions>('/initial-seeding', (req, res) => {
  req.services?.clientGatewayService?.setTorrentsInitialSeeding(req.body).then(
    (response) => {
      req.services?.torrentService.fetchTorrentList();
      res.status(200).json(response);
    },
    (err) => {
      res.status(500).json(err);
    },
  );
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
  const callback = getResponseFn(res);

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
 * PATCH /api/torrents/sequential
 * @summary Sets sequential mode of torrents.
 * @tags Torrent
 * @security User
 * @param {SetTorrentsSequentialOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<unknown, unknown, SetTorrentsSequentialOptions>('/sequential', (req, res) => {
  req.services?.clientGatewayService?.setTorrentsSequential(req.body).then(
    (response) => {
      req.services?.torrentService.fetchTorrentList();
      res.status(200).json(response);
    },
    (err) => {
      res.status(500).json(err);
    },
  );
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
  const parsedResult = setTorrentsTagsSchema.safeParse(req.body);

  if (!parsedResult.success) {
    validationError(res, parsedResult.error);
    return;
  }

  req.services?.clientGatewayService?.setTorrentsTags(parsedResult.data).then(
    (response) => {
      req.services?.torrentService.fetchTorrentList();
      res.status(200).json(response);
    },
    (err) => {
      res.status(500).json(err);
    },
  );
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
  const callback = getResponseFn(res);

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
 * GET /api/torrents/{hash(, hash2, ...)}/metainfo
 * @summary Gets meta-info (.torrent) files of torrents
 * @tags Torrents
 * @security User
 * @param {string} hashes.path - Hash of a torrent, or hashes of torrents (split by ,)
 * @return {object} 200 - single torrent - application/x-bittorrent
 * @return {object} 200 - torrents archived in .tar - application/x-tar
 * @return {Error} 422 - hash not provided - application/json
 * @return {Error} 500 - other failure responses - application/json
 */
router.get<{hashes: string}>(
  '/:hashes/metainfo',
  // This operation is resource-intensive
  // Limit each IP to 60 requests every 5 minutes
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 60,
  }),
  async (req, res) => {
    const hashes: Array<string> = req.params.hashes?.split(',').map((hash) => sanitize(hash));
    if (!Array.isArray(hashes) || hashes?.length < 1) {
      res.status(422).json(new Error('Hash not provided.'));
      return;
    }

    const {path: sessionDirectory, case: torrentCase} =
      (await req.services?.clientGatewayService?.getClientSessionDirectory().catch(() => undefined)) || {};

    if (sessionDirectory == null || !fs.existsSync(sessionDirectory)) {
      res.status(500).json(new Error('Failed to get session directory.'));
      return;
    }

    const torrentFileNames = hashes.map(
      (hash) => `${torrentCase === 'lower' ? hash.toLowerCase() : hash.toUpperCase()}.torrent`,
    );

    if (hashes.length < 2) {
      res.attachment(torrentFileNames[0]);
      res.download(path.join(sessionDirectory, torrentFileNames[0]));
      return;
    }

    try {
      torrentFileNames.forEach((torrentFileName) =>
        fs.accessSync(path.join(sessionDirectory, torrentFileName), fs.constants.R_OK),
      );
    } catch {
      res.status(404).json('Failed to access torrent files.');
      return;
    }

    res.attachment(`torrents-${Date.now()}.tar`);
    tar
      .c(
        {
          cwd: sessionDirectory,
          follow: false,
          noDirRecurse: true,
          portable: true,
        },
        torrentFileNames,
      )
      .pipe(res);
  },
);

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
  const callback = getResponseFn(res);

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
  const callback = getResponseFn(res);

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
router.get(
  '/:hash/contents/:indices/data',
  // This operation is resource-intensive
  // Limit each IP to 60 requests every 5 minutes
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 60,
  }),
  (req, res) => {
    const {hash, indices: stringIndices} = req.params;
    const selectedTorrent = req.services?.torrentService.getTorrent(hash);
    if (!selectedTorrent) return res.status(404).json({error: 'Torrent not found.'});

    req.services?.clientGatewayService
      ?.getTorrentContents(hash)
      .then((contents) => {
        if (!contents || contents.length < 1) {
          return res.status(404).json({error: 'Torrent contents not found'});
        }

        let indices: Array<number>;
        if (!stringIndices || stringIndices === 'all') {
          indices = contents.map((x) => x.index);
        } else {
          indices = stringIndices.split(',').map((value) => Number(value));
        }

        const filePathsToDownload = contents
          .filter((content) => indices.includes(content.index))
          .map((content) => sanitizePath(path.join(selectedTorrent.directory, content.path)))
          .filter((filePath) => isAllowedPath(filePath))
          .filter((filePath) => fs.existsSync(filePath));

        if (filePathsToDownload.length < 1) {
          return res.status(404).json({error: 'File not found.'});
        }

        if (filePathsToDownload.length === 1) {
          const file = filePathsToDownload[0];

          const fileName = path.basename(file);
          const fileExt = path.extname(file);

          let processedType: string = fileExt;
          switch (fileExt) {
            // Browsers don't support MKV streaming. However, browsers do support WebM which is a
            // subset of MKV. Chromium supports MKV when encoded in selected codecs.
            case '.mkv':
              processedType = 'video/webm';
              break;
            // MIME database uses x-flac which is not recognized by browsers as streamable audio.
            case '.flac':
              processedType = 'audio/flac';
              break;
            default:
              break;
          }

          res.type(processedType);

          // Allow browsers to display the content inline when only a single content is requested.
          // This is useful for texts, videos and audios. Users can still download them if needed.
          res.setHeader('content-disposition', contentDisposition(fileName, {type: 'inline'}));

          return res.sendFile(file);
        }

        const archiveRootFolder = sanitizePath(selectedTorrent.directory);
        const relativeFilePaths = filePathsToDownload.map((filePath) =>
          filePath.replace(`${archiveRootFolder}${path.sep}`, ''),
        );

        res.attachment(`${selectedTorrent.name}.tar`);
        return tar
          .c(
            {
              cwd: archiveRootFolder,
              follow: false,
              noDirRecurse: true,
              portable: true,
            },
            relativeFilePaths,
          )
          .pipe(res);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  },
);

/**
 * GET /api/torrents/{hash}/details
 * @summary Gets details of a torrent.
 * @tags Torrent
 * @security User
 * @param {string} hash.path
 */
router.get('/:hash/details', async (req, res) => {
  const callback = getResponseFn(res);

  try {
    const contents = req.services?.clientGatewayService?.getTorrentContents(req.params.hash);
    const peers = req.services?.clientGatewayService?.getTorrentPeers(req.params.hash);
    const trackers = req.services?.clientGatewayService?.getTorrentTrackers(req.params.hash);

    await Promise.all([contents, peers, trackers]);

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
router.get<{hash: string}>(
  '/:hash/mediainfo',
  // This operation is resource-intensive
  // Limit each IP to 30 requests every 5 minutes
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 30,
  }),
  async (req, res) => {
    const callback = getResponseFn(res);

    const torrentDirectory = req.services?.torrentService.getTorrent(req.params.hash)?.directory;
    const torrentContents = await req.services?.clientGatewayService
      ?.getTorrentContents(req.params.hash)
      .catch(() => undefined);

    if (torrentDirectory == null || torrentContents == null || torrentContents.length < 1) {
      callback(null, new Error('Failed to fetch info of torrent.'));
      return;
    }

    try {
      let torrentContentPaths = torrentContents?.map((content) =>
        sanitizePath(path.join(torrentDirectory, content.path)),
      );

      torrentContentPaths = torrentContentPaths.filter((contentPath) => isAllowedPath(contentPath));
      if (torrentContentPaths.length < 1) {
        callback(null, accessDeniedError());
        return;
      }

      torrentContentPaths = torrentContentPaths.filter((contentPath) => fs.existsSync(contentPath));
      if (torrentContentPaths.length < 1) {
        callback(null, fileNotFoundError());
        return;
      }

      const mediainfoProcess = childProcess.execFile(
        'mediainfo',
        torrentContentPaths,
        {maxBuffer: 1024 * 2000, timeout: 1000 * 10},
        (error, stdout, stderr) => {
          if (error) {
            callback(null, error);
            return;
          }

          if (stderr) {
            callback(null, stderr);
            return;
          }

          callback({output: stdout});
        },
      );

      req.on('close', () => mediainfoProcess.kill('SIGTERM'));
    } catch (error) {
      callback(null, error);
    }
  },
);

/**
 * GET /api/torrents/{hash}/peers
 * @summary Gets the list of peers of a torrent.
 * @tags Torrent
 * @security User
 * @param {string} hash.path
 */
router.get('/:hash/peers', (req, res) => {
  const callback = getResponseFn(res);

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
  const callback = getResponseFn(res);

  req.services?.clientGatewayService
    ?.getTorrentTrackers(req.params.hash)
    .then(callback)
    .catch((err) => {
      callback(null, err);
    });
});

export default router;
