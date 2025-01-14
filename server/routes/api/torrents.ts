import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import type {
  AddTorrentByFileOptions,
  AddTorrentByURLOptions,
  ContentToken,
  ReannounceTorrentsOptions,
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
import contentDisposition from 'content-disposition';
import createTorrent from 'create-torrent';
import express, {Response} from 'express';
import sanitize from 'sanitize-filename';
import tar, {Pack} from 'tar-fs';

import {
  addTorrentByFileSchema,
  addTorrentByURLSchema,
  reannounceTorrentsSchema,
  setTorrentsTagsSchema,
} from '../../../shared/schema/api/torrents';
import {getTempPath} from '../../models/TemporaryStorage';
import {asyncFilter} from '../../util/async';
import {getToken} from '../../util/authUtil';
import {
  accessDeniedError,
  existAsync,
  fileNotFoundError,
  isAllowedPath,
  isAllowedPathAsync,
  sanitizePath,
} from '../../util/fileUtil';
import {rateLimit} from '../utils';

const getDestination = async (
  services: Express.Request['services'],
  {destination, tags}: {destination?: string; tags?: Array<string>},
): Promise<string | undefined> => {
  let autoDestination = destination === '' ? undefined : destination;

  // Use preferred destination of the first tag
  if (autoDestination == null) {
    await services.settingService.get('torrentDestinations').then(
      ({torrentDestinations}) => {
        autoDestination = torrentDestinations?.[tags?.[0] ?? ''];
      },
      () => undefined,
    );
  }

  // Use default destination of torrent client
  if (autoDestination == null) {
    const {directoryDefault} = (await services.clientGatewayService.getClientSettings().catch(() => undefined)) ?? {};
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
router.get(
  '/',
  async (req, res): Promise<Response> =>
    req.services.torrentService
      .fetchTorrentList()
      .then((data) => {
        if (data == null) {
          throw new Error();
        }
        return res.status(200).json(data);
      })
      .catch(({code, message}) => res.status(500).json({code, message})),
);

/**
 * POST /api/torrents/add-urls
 * @summary Adds torrents by URLs.
 * @tags Torrents
 * @security User
 * @param {AddTorrentByURLOptions} request.body.required - options - application/json
 * @return {object} 200 - all torrents added - application/json
 * @return {object} 202 - requests sent to torrent client - application/json
 * @return {object} 207 - some succeed, some failed - application/json
 * @return {Error} 403 - illegal destination - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, AddTorrentByURLOptions>('/add-urls', async (req, res): Promise<Response> => {
  const parsedResult = addTorrentByURLSchema.safeParse(req.body);

  if (!parsedResult.success) {
    return res.status(422).json({message: 'Validation error.'});
  }

  const {urls, cookies, destination, tags, isBasePath, isCompleted, isSequential, isInitialSeeding, start} =
    parsedResult.data;

  const finalDestination = await getDestination(req.services, {
    destination,
    tags,
  });

  if (finalDestination == null) {
    const {code, message} = accessDeniedError();
    return res.status(403).json({code, message});
  }

  return req.services.clientGatewayService
    .addTorrentsByURL({
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
    .then(
      (response) => {
        req.services.torrentService.fetchTorrentList();
        if (response.length === 0) {
          return res.status(202).json(response);
        } else if (response.length < urls.length) {
          return res.status(207).json(response);
        } else {
          return res.status(200).json(response);
        }
      },
      ({code, message}) => res.status(500).json({code, message}),
    );
});

/**
 * POST /api/torrents/add-files
 * @summary Adds torrents by files.
 * @tags Torrents
 * @security User
 * @param {AddTorrentByFileOptions} request.body.required - options - application/json
 * @return {object} 200 - all torrents added - application/json
 * @return {object} 202 - requests sent to torrent client - application/json
 * @return {object} 207 - some succeed, some failed - application/json
 * @return {Error} 403 - illegal destination - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, AddTorrentByFileOptions>('/add-files', async (req, res): Promise<Response> => {
  const parsedResult = addTorrentByFileSchema.safeParse(req.body);

  if (!parsedResult.success) {
    return res.status(422).json({message: 'Validation error.'});
  }

  const {files, destination, tags, isBasePath, isCompleted, isSequential, isInitialSeeding, start} = parsedResult.data;

  const finalDestination = await getDestination(req.services, {
    destination,
    tags,
  });

  if (finalDestination == null) {
    const {code, message} = accessDeniedError();
    return res.status(403).json({code, message});
  }

  return req.services.clientGatewayService
    .addTorrentsByFile({
      files,
      destination: finalDestination,
      tags: tags ?? [],
      isBasePath: isBasePath ?? false,
      isCompleted: isCompleted ?? false,
      isSequential: isSequential ?? false,
      isInitialSeeding: isInitialSeeding ?? false,
      start: start ?? false,
    })
    .then(
      (response) => {
        req.services.torrentService.fetchTorrentList();
        if (response.length === 0) {
          return res.status(202).json(response);
        } else if (response.length < files.length) {
          return res.status(207).json(response);
        } else {
          return res.status(200).json(response);
        }
      },
      ({code, message}) => res.status(500).json({code, message}),
    );
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
router.post<unknown, unknown, CreateTorrentOptions>('/create', async (req, res): Promise<Response> => {
  const {name, sourcePath, trackers, comment, infoSource, isPrivate, isInitialSeeding, tags, start} = req.body;

  if (typeof sourcePath !== 'string') {
    return res.status(422).json({message: 'Validation error.'});
  }

  const sanitizedPath = sanitizePath(sourcePath);
  if (!isAllowedPath(sanitizedPath)) {
    const {code, message} = accessDeniedError();
    return res.status(403).json({code, message});
  }

  const torrentFileName = sanitize(name ?? sanitizedPath.split(path.sep).pop() ?? `${Date.now()}`).concat('.torrent');

  let torrent: Buffer;
  try {
    torrent = await new Promise<Buffer>((resolve, reject) => {
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
        (err, torrent) => (err ? reject(err) : resolve(torrent)),
      );
    });
  } catch ({message}) {
    return res.status(500).json({message});
  }

  await req.services.clientGatewayService
    .addTorrentsByFile({
      files: [torrent.toString('base64')],
      destination: (await fs.promises.lstat(sanitizedPath)).isDirectory() ? sanitizedPath : path.dirname(sanitizedPath),
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

  res.attachment(torrentFileName);
  res.contentType('application/x-bittorrent');

  return res.status(200).send(torrent);
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
router.post<unknown, unknown, StartTorrentsOptions>(
  '/start',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.startTorrents(req.body).then(
      (response) => {
        req.services.torrentService.fetchTorrentList();
        return res.status(200).json(response);
      },
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * POST /api/torrents/stop
 * @summary Stops torrents.
 * @tags Torrents
 * @security User
 * @param {StopTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, StopTorrentsOptions>(
  '/stop',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.stopTorrents(req.body).then(
      (response) => {
        req.services.torrentService.fetchTorrentList();
        return res.status(200).json(response);
      },
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * POST /api/torrents/check-hash
 * @summary Hash checks torrents.
 * @tags Torrents
 * @security User
 * @param {CheckTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, CheckTorrentsOptions>(
  '/check-hash',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.checkTorrents(req.body).then(
      (response) => {
        req.services.torrentService.fetchTorrentList();
        return res.status(200).json(response);
      },
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * POST /api/torrents/move
 * @summary Moves torrents to specified destination path.
 * @tags Torrents
 * @security User
 * @param {MoveTorrentsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, MoveTorrentsOptions>('/move', async (req, res): Promise<Response> => {
  let sanitizedPath: string | null = null;
  try {
    sanitizedPath = sanitizePath(req.body.destination);
    if (!isAllowedPath(sanitizedPath)) {
      const {code, message} = accessDeniedError();
      return res.status(403).json({code, message});
    }
  } catch ({code, message}) {
    return res.status(403).json({code, message});
  }

  return req.services.clientGatewayService.moveTorrents({...req.body, destination: sanitizedPath}).then(
    (response) => {
      req.services.torrentService.fetchTorrentList();
      return res.status(200).json(response);
    },
    ({code, message}) => res.status(500).json({code, message}),
  );
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
router.post<unknown, unknown, DeleteTorrentsOptions>(
  '/delete',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.removeTorrents(req.body).then(
      (response) => {
        req.services.torrentService.fetchTorrentList();
        return res.status(200).json(response);
      },
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * POST /api/torrents/reannounce
 * @summary Reannounces torrents to trackers
 * @tags Torrents
 * @security User
 * @param {ReannounceTorrentsOptions} - request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.post<unknown, unknown, ReannounceTorrentsOptions>('/reannounce', async (req, res): Promise<Response> => {
  const parsedResult = reannounceTorrentsSchema.safeParse(req.body);

  if (!parsedResult.success) {
    return res.status(422).json({message: 'Validation error.'});
  }

  return req.services.clientGatewayService.reannounceTorrents(parsedResult.data).then(
    (response) => {
      req.services.clientGatewayService.fetchTorrentList();
      return res.status(200).json(response);
    },
    ({code, message}) => res.status(500).json({code, message}),
  );
});

/**
 * PATCH /api/torrents/initial-seeding
 * @summary Sets initial seeding mode of torrents.
 * @tags Torrents
 * @security User
 * @param {SetTorrentsInitialSeedingOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<unknown, unknown, SetTorrentsInitialSeedingOptions>(
  '/initial-seeding',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.setTorrentsInitialSeeding(req.body).then(
      (response) => {
        req.services.torrentService.fetchTorrentList();
        return res.status(200).json(response);
      },
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * PATCH /api/torrents/priority
 * @summary Sets priority of torrents.
 * @tags Torrents
 * @security User
 * @param {SetTorrentsPriorityOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<unknown, unknown, SetTorrentsPriorityOptions>(
  '/priority',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.setTorrentsPriority(req.body).then(
      (response) => {
        req.services.torrentService.fetchTorrentList();
        return res.status(200).json(response);
      },
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * PATCH /api/torrents/sequential
 * @summary Sets sequential mode of torrents.
 * @tags Torrents
 * @security User
 * @param {SetTorrentsSequentialOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<unknown, unknown, SetTorrentsSequentialOptions>(
  '/sequential',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.setTorrentsSequential(req.body).then(
      (response) => {
        req.services.torrentService.fetchTorrentList();
        return res.status(200).json(response);
      },
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * PATCH /api/torrents/tags
 * @summary Sets tags of torrents.
 * @tags Torrents
 * @security User
 * @param {SetTorrentsTagsOptions} request.body.required - options - application/json
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.patch<unknown, unknown, SetTorrentsTagsOptions>('/tags', async (req, res): Promise<Response> => {
  const parsedResult = setTorrentsTagsSchema.safeParse(req.body);

  if (!parsedResult.success) {
    return res.status(422).json({message: 'Validation error.'});
  }

  return req.services.clientGatewayService.setTorrentsTags(parsedResult.data).then(
    (response) => {
      req.services.torrentService.fetchTorrentList();
      return res.status(200).json(response);
    },
    ({code, message}) => res.status(500).json({code, message}),
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
router.patch<unknown, unknown, SetTorrentsTrackersOptions>(
  '/trackers',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.setTorrentsTrackers(req.body).then(
      (response) => {
        req.services.torrentService.fetchTorrentList();
        return res.status(200).json(response);
      },
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

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
  async (req, res): Promise<Response> => {
    const hashes: Array<string> = req.params.hashes?.split(',').map((hash) => sanitize(hash));
    if (!Array.isArray(hashes) || hashes?.length < 1) {
      return res.status(422).json(new Error('Hash not provided.'));
    }

    const {path: sessionDirectory, case: torrentCase} =
      (await req.services.clientGatewayService.getClientSessionDirectory().catch(() => undefined)) || {};

    if (sessionDirectory == null) {
      return res.status(500).json(new Error('Failed to get session directory.'));
    }

    const torrentFileNames = hashes.map(
      (hash) => `${torrentCase === 'lower' ? hash.toLowerCase() : hash.toUpperCase()}.torrent`,
    );

    try {
      await Promise.all(
        torrentFileNames.map(
          async (torrentFileName) =>
            await fs.promises.access(path.join(sessionDirectory, torrentFileName), fs.constants.R_OK),
        ),
      );
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        return res.status(404).json({code: err.code, message: err.message});
      }
      return res.status(500).json({
        code: err.code,
        message: `Failed to access torrent files: ${e}`,
      });
    }

    if (hashes.length < 2) {
      res.attachment(torrentFileNames[0]);
      res.download(path.join(sessionDirectory, torrentFileNames[0]));
      return res;
    }

    res.attachment(`torrents-${Date.now()}.tar`);

    return tar
      .pack(sessionDirectory, {
        entries: torrentFileNames,
        strict: true,
        dereference: false,
      })
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
 * @return {object} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get(
  '/:hash/contents',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.getTorrentContents(req.params.hash).then(
      (contents) => res.status(200).json(contents),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

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
router.patch<{hash: string}, unknown, SetTorrentContentsPropertiesOptions>(
  '/:hash/contents',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.setTorrentContentsPriority(req.params.hash, req.body).then(
      (response) => res.status(200).json(response),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * GET /api/torrents/{hash}/contents/{indices}/token
 * @summary Gets retrieval token of contents of a torrent.
 * @tags Torrent
 * @security User
 * @param {string} hash.path
 * @param {string} indices.path - 'all' or indices of selected contents separated by ','
 * @return {string} 200 - token - text/plain
 */
router.get<{hash: string; indices: string}, unknown, unknown, {token: string}>(
  '/:hash/contents/:indices/token',
  // This operation performs authentication operations.
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 200,
  }),
  async (req, res): Promise<Response> => {
    if (!req.user) {
      return res.status(500).json({message: 'User is not attached.'});
    }

    const {hash, indices} = req.params;
    return res.status(200).send(
      getToken<ContentToken>({
        username: req.user.username,
        hash,
        indices,
      }),
    );
  },
);

/**
 * GET /api/torrents/{hash}/contents/{indices}/data
 * @summary Gets downloaded data of contents of a torrent.
 * @tags Torrent
 * @security User
 * @param {string} hash.path
 * @param {string} indices.path - 'all' or indices of selected contents separated by ','
 * @return {object} 200 - contents archived in .tar - application/x-tar
 */
router.get<{hash: string; indices: string}, unknown, unknown, {token: string}>(
  '/:hash/contents/:indices/data',
  // This operation is resource-intensive
  // Limit each IP to 200 requests every 5 minutes
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 200,
  }),
  async (req, res): Promise<Response> => {
    const {hash, indices: stringIndices} = req.params;

    if (req.user != null && req.query.token == null) {
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1689018
      if (req.headers?.['user-agent']?.includes('Firefox/') !== true) {
        res.redirect(
          `?token=${getToken<ContentToken>({
            username: req.user.username,
            hash,
            indices: stringIndices,
          })}`,
        );
        return res;
      }
    }

    const selectedTorrent = req.services.torrentService.getTorrent(hash);
    if (!selectedTorrent) {
      return res.status(404).json({error: 'Torrent not found.'});
    }

    return req.services.clientGatewayService
      .getTorrentContents(hash)
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

        let filePathsToDownload = contents
          .filter((content) => indices.includes(content.index))
          .map((content) => sanitizePath(path.join(selectedTorrent.directory, content.path)));

        filePathsToDownload = filePathsToDownload.filter((filePath) => isAllowedPath(filePath));

        if (filePathsToDownload.length !== indices.length) {
          const {code, message} = accessDeniedError();
          return res.status(403).json({code, message});
        }

        filePathsToDownload = filePathsToDownload.filter((filePath) => fs.existsSync(filePath));

        if (filePathsToDownload.length < 1 || filePathsToDownload.length !== indices.length) {
          const {code, message} = fileNotFoundError();
          return res.status(404).json({code, message});
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

          res.sendFile(file);

          return res;
        }

        const archiveRootFolder = sanitizePath(selectedTorrent.directory);
        const relativeFilePaths = filePathsToDownload.map((filePath) =>
          filePath.replace(`${archiveRootFolder}${path.sep}`, ''),
        );

        res.attachment(`${selectedTorrent.name}.tar`);

        const tarOptions: tar.PackOptions = {
          strict: true,
          dereference: false,
        };

        // Append file one by one to avoid OOM
        const appendEntry = (prevPack: Pack) => {
          const entry = relativeFilePaths.shift();

          if (entry == null) {
            prevPack.finalize();
          } else {
            tar.pack(archiveRootFolder, {
              pack: prevPack,
              entries: [entry],
              ...tarOptions,
              finalize: false,
              finish: appendEntry,
            });
          }
        };

        const tarStream = tar.pack(archiveRootFolder, {
          entries: [relativeFilePaths.shift() as string],
          ...tarOptions,
          finalize: false,
          finish: appendEntry,
        });

        tarStream.pipe(res).once('close', () => {
          tarStream.unpipe(res);
          res.destroy();
        });

        return res;
      })
      .catch(({code, message}) => res.status(500).json({code, message}));
  },
);

/**
 * GET /api/torrents/{hash}/details
 * @summary Gets details of a torrent.
 * @tags Torrent
 * @security User
 * @param {string} hash.path
 */
router.get('/:hash/details', async (req, res): Promise<Response> => {
  try {
    const contents = req.services.clientGatewayService.getTorrentContents(req.params.hash);
    const peers = req.services.clientGatewayService.getTorrentPeers(req.params.hash);
    const trackers = req.services.clientGatewayService.getTorrentTrackers(req.params.hash);

    await Promise.all([contents, peers, trackers]);

    return res.status(200).json({
      contents: await contents,
      peers: await peers,
      trackers: await trackers,
    });
  } catch ({code, message}) {
    return res.status(500).json({code, message});
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
  async (req, res): Promise<Response> => {
    const torrentDirectory = req.services.torrentService.getTorrent(req.params.hash)?.directory;
    const torrentContents = await req.services.clientGatewayService
      .getTorrentContents(req.params.hash)
      .catch(() => undefined);

    if (torrentDirectory == null || torrentContents == null || torrentContents.length < 1) {
      return res.status(404).json({message: 'Failed to fetch info of torrent.'});
    }

    try {
      let torrentContentPaths = torrentContents?.map((content) =>
        sanitizePath(path.join(torrentDirectory, content.path)),
      );

      torrentContentPaths = await asyncFilter(torrentContentPaths, (contentPath) => isAllowedPathAsync(contentPath));
      if (torrentContentPaths.length < 1) {
        const {code, message} = accessDeniedError();
        return res.status(403).json({code, message});
      }

      torrentContentPaths = await asyncFilter(torrentContentPaths, (contentPath) => existAsync(contentPath));
      if (torrentContentPaths.length < 1) {
        const {code, message} = fileNotFoundError();
        return res.status(404).json({code, message});
      }

      const args = torrentContentPaths.filter((x) => {
        const fn = x.toLowerCase();
        for (const ext of ['.mp4', '.mkv', '.ts', '.avi', '.rmvb', '.dat', '.wmv', '.iso']) {
          if (fn.endsWith(ext)) {
            return true;
          }
        }
        return false;
      });

      if (args.length < 1) {
        return res.status(200).json({
          output:
            'no video file found.\nIf this is a error, please create a issue at https://github.com/jesec/flood/issues',
        });
      }

      const mediainfoProcess = childProcess.execFile(
        'mediainfo',
        args.map((x) => path.relative(torrentDirectory, x)),
        {maxBuffer: 1024 * 2000, timeout: 1000 * 10, cwd: torrentDirectory},
        (error, stdout) => {
          if (error) {
            return res.status(500).json({code: error.code, message: error.message});
          }

          return res.status(200).json({output: stdout});
        },
      );

      req.on('close', () => mediainfoProcess.kill('SIGTERM'));

      return res;
    } catch ({code, message}) {
      return res.status(500).json({code, message});
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
router.get(
  '/:hash/peers',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.getTorrentPeers(req.params.hash).then(
      (peers) => res.status(200).json(peers),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

/**
 * GET /api/torrents/{hash}/trackers
 * @summary Gets the list of trackers of a torrent.
 * @tags Torrent
 * @security User
 * @param {string} hash.path
 * @return {Array<TorrentTracker>} 200 - success response - application/json
 * @return {Error} 500 - failure response - application/json
 */
router.get(
  '/:hash/trackers',
  async (req, res): Promise<Response> =>
    req.services.clientGatewayService.getTorrentTrackers(req.params.hash).then(
      (trackers) => res.status(200).json(trackers),
      ({code, message}) => res.status(500).json({code, message}),
    ),
);

export default router;
