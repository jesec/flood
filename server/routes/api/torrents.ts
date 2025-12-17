import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {promisify} from 'node:util';

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
//@ts-expect-error missing types
import createTorrent from 'create-torrent';
import type {FastifyInstance, FastifyRequest, RouteGenericInterface} from 'fastify';
import {ZodTypeProvider} from 'fastify-type-provider-zod';
import sanitize from 'sanitize-filename';
import tar, {Pack} from 'tar-fs';

import {
  addTorrentByFileSchema,
  addTorrentByURLSchema,
  reannounceTorrentsSchema,
  setTorrentsTagsSchema,
} from '../../../shared/schema/api/torrents';
import {getTempPath} from '../../models/TemporaryStorage';
import type {ServiceInstances} from '../../services';
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

type FloodRequest<T extends RouteGenericInterface = RouteGenericInterface> = FastifyRequest<T> & {
  services: NonNullable<FastifyRequest['services']>;
  user: NonNullable<FastifyRequest['user']>;
};

const createTorrentAsync = promisify(createTorrent) as (
  input: string,
  opts?: {
    name?: string;
    creationDate?: Date;
    comment?: string;
    createdBy?: string;
    private?: boolean | number;
    pieceLength?: number;
    maxPieceLength?: number;
    announceList?: string[][];
    urlList?: string[];
    info?: any;
    onProgress?: unknown;
  },
) => Promise<Buffer>;

const getDestination = async (
  services: ServiceInstances,
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
  } catch {
    return undefined;
  }

  return sanitizedPath;
};

const torrentsRoutes = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * GET /api/torrents
   * @summary Gets the list of torrents
   * @tags Torrents
   * @security User
   * @return {TorrentListSummary} 200 - success response - application/json
   * @return {Error} 500 - failure response - application/json
   */
  fastify.get('/', async (req, reply) => {
    const request = req as FloodRequest;

    try {
      const data = await request.services.torrentService.fetchTorrentList();
      if (data == null) {
        throw new Error();
      }
      return reply.status(200).send(data);
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
    }
  });

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
  typedFastify.post<{
    Body: AddTorrentByURLOptions;
  }>(
    '/add-urls',
    {
      schema: {
        body: addTorrentByURLSchema,
      },
    },
    async (req, reply) => {
      const request = req as FloodRequest<{Body: AddTorrentByURLOptions}>;
      const {urls, cookies, destination, tags, isBasePath, isCompleted, isSequential, isInitialSeeding, start} =
        request.body;

      const finalDestination = await getDestination(request.services, {
        destination,
        tags,
      });

      if (finalDestination == null) {
        const {code, message} = accessDeniedError();
        return reply.status(403).send({code, message});
      }

      try {
        const response = await request.services.clientGatewayService.addTorrentsByURL({
          urls,
          cookies: cookies != null ? cookies : {},
          destination: finalDestination,
          tags: tags ?? [],
          isBasePath: isBasePath ?? false,
          isCompleted: isCompleted ?? false,
          isSequential: isSequential ?? false,
          isInitialSeeding: isInitialSeeding ?? false,
          start: start ?? false,
        });

        request.services.torrentService.fetchTorrentList();
        if (response.length === 0) {
          return reply.status(202).send(response);
        }
        if (response.length < urls.length) {
          return reply.status(207).send(response);
        }
        return reply.status(200).send(response);
      } catch (error) {
        const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
        return reply.status(500).send({code, message});
      }
    },
  );

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
  typedFastify.post<{
    Body: AddTorrentByFileOptions;
  }>(
    '/add-files',
    {
      schema: {
        body: addTorrentByFileSchema,
      },
    },
    async (req, reply) => {
      const request = req as FloodRequest<{Body: AddTorrentByFileOptions}>;
      const {files, destination, tags, isBasePath, isCompleted, isSequential, isInitialSeeding, start} = request.body;

      const finalDestination = await getDestination(request.services, {
        destination,
        tags,
      });

      if (finalDestination == null) {
        const {code, message} = accessDeniedError();
        return reply.status(403).send({code, message});
      }

      try {
        const response = await request.services.clientGatewayService.addTorrentsByFile({
          files,
          destination: finalDestination,
          tags: tags ?? [],
          isBasePath: isBasePath ?? false,
          isCompleted: isCompleted ?? false,
          isSequential: isSequential ?? false,
          isInitialSeeding: isInitialSeeding ?? false,
          start: start ?? false,
        });

        request.services.torrentService.fetchTorrentList();
        if (response.length === 0) {
          return reply.status(202).send(response);
        }
        if (response.length < files.length) {
          return reply.status(207).send(response);
        }
        return reply.status(200).send(response);
      } catch (error) {
        const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
        return reply.status(500).send({code, message});
      }
    },
  );

  /**
   * POST /api/torrents/create
   * @summary Creates a torrent
   * @tags Torrents
   * @security User
   * @param {CreateTorrentOptions} request.body.required - options - application/json
   * @return {object} 200 - success response - application/x-bittorrent
   * @return {Error} 500 - failure response - application/json
   */
  fastify.post<{
    Body: CreateTorrentOptions;
  }>('/create', async (req, reply) => {
    const request = req as FloodRequest<{Body: CreateTorrentOptions}>;
    const {name, sourcePath, trackers, comment, infoSource, isPrivate, isInitialSeeding, tags, start} = request.body;

    if (typeof sourcePath !== 'string') {
      return reply.status(422).send({message: 'Validation error.'});
    }

    const sanitizedPath = sanitizePath(sourcePath);
    if (!isAllowedPath(sanitizedPath)) {
      const {code, message} = accessDeniedError();
      return reply.status(403).send({code, message});
    }

    const torrentFileName = sanitize(name ?? sanitizedPath.split(path.sep).pop() ?? `${Date.now()}`).concat('.torrent');

    let torrent: Buffer;
    try {
      const announceList = trackers != null && trackers.length > 0 ? trackers.map((tracker) => [tracker]) : undefined;
      const result = await createTorrentAsync(sanitizedPath, {
        name,
        comment,
        createdBy: 'Flood - flood.js.org',
        private: isPrivate,
        announceList,
        info: infoSource
          ? {
              source: infoSource,
            }
          : undefined,
      });

      torrent = result;
    } catch (error) {
      const {message} = (error as {message?: string}) ?? {};
      return reply.status(500).send({message});
    }

    await request.services.clientGatewayService
      .addTorrentsByFile({
        files: [torrent.toString('base64')],
        destination: (await fs.promises.lstat(sanitizedPath)).isDirectory()
          ? sanitizedPath
          : path.dirname(sanitizedPath),
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

    return reply
      .header('Content-Disposition', contentDisposition(torrentFileName))
      .type('application/x-bittorrent')
      .status(200)
      .send(torrent);
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
  fastify.post<{
    Body: StartTorrentsOptions;
  }>('/start', async (req, reply) => {
    const request = req as FloodRequest<{Body: StartTorrentsOptions}>;

    try {
      const response = await request.services.clientGatewayService.startTorrents(request.body);
      request.services.torrentService.fetchTorrentList();
      return reply.status(200).send(response);
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
    }
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
  fastify.post<{
    Body: StopTorrentsOptions;
  }>('/stop', async (req, reply) => {
    const request = req as FloodRequest<{Body: StopTorrentsOptions}>;

    try {
      const response = await request.services.clientGatewayService.stopTorrents(request.body);
      request.services.torrentService.fetchTorrentList();
      return reply.status(200).send(response);
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
    }
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
  fastify.post<{
    Body: CheckTorrentsOptions;
  }>('/check-hash', async (req, reply) => {
    const request = req as FloodRequest<{Body: CheckTorrentsOptions}>;

    try {
      const response = await request.services.clientGatewayService.checkTorrents(request.body);
      request.services.torrentService.fetchTorrentList();
      return reply.status(200).send(response);
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
    }
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
  fastify.post<{
    Body: MoveTorrentsOptions;
  }>('/move', async (req, reply) => {
    const request = req as FloodRequest<{Body: MoveTorrentsOptions}>;
    let sanitizedPath: string | null = null;

    try {
      sanitizedPath = sanitizePath(request.body.destination);
      if (!isAllowedPath(sanitizedPath)) {
        const {code, message} = accessDeniedError();
        return reply.status(403).send({code, message});
      }
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(403).send({code, message});
    }

    try {
      const response = await request.services.clientGatewayService.moveTorrents({
        ...request.body,
        destination: sanitizedPath,
      });
      request.services.torrentService.fetchTorrentList();
      return reply.status(200).send(response);
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
    }
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
  fastify.post<{
    Body: DeleteTorrentsOptions;
  }>('/delete', async (req, reply) => {
    const request = req as FloodRequest<{Body: DeleteTorrentsOptions}>;

    try {
      const response = await request.services.clientGatewayService.removeTorrents(request.body);
      request.services.torrentService.fetchTorrentList();
      return reply.status(200).send(response);
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
    }
  });

  /**
   * POST /api/torrents/reannounce
   * @summary Reannounces torrents to trackers
   * @tags Torrents
   * @security User
   * @param {ReannounceTorrentsOptions} - request.body.required - options - application/json
   * @return {object} 200 - success response - application/json
   * @return {Error} 500 - failure response - application/json
   */
  typedFastify.post<{
    Body: ReannounceTorrentsOptions;
  }>(
    '/reannounce',
    {
      schema: {
        body: reannounceTorrentsSchema,
      },
    },
    async (req, reply) => {
      const request = req as FloodRequest<{Body: ReannounceTorrentsOptions}>;

      try {
        const response = await request.services.clientGatewayService.reannounceTorrents(request.body);
        request.services.clientGatewayService.fetchTorrentList();
        return reply.status(200).send(response);
      } catch (error) {
        const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
        return reply.status(500).send({code, message});
      }
    },
  );

  /**
   * PATCH /api/torrents/initial-seeding
   * @summary Sets initial seeding mode of torrents.
   * @tags Torrents
   * @security User
   * @param {SetTorrentsInitialSeedingOptions} request.body.required - options - application/json
   * @return {object} 200 - success response - application/json
   * @return {Error} 500 - failure response - application/json
   */
  fastify.patch<{
    Body: SetTorrentsInitialSeedingOptions;
  }>('/initial-seeding', async (req, reply) => {
    const request = req as FloodRequest<{Body: SetTorrentsInitialSeedingOptions}>;

    try {
      const response = await request.services.clientGatewayService.setTorrentsInitialSeeding(request.body);
      request.services.torrentService.fetchTorrentList();
      return reply.status(200).send(response);
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
    }
  });

  /**
   * PATCH /api/torrents/priority
   * @summary Sets priority of torrents.
   * @tags Torrents
   * @security User
   * @param {SetTorrentsPriorityOptions} request.body.required - options - application/json
   * @return {object} 200 - success response - application/json
   * @return {Error} 500 - failure response - application/json
   */
  fastify.patch<{
    Body: SetTorrentsPriorityOptions;
  }>('/priority', async (req, reply) => {
    const request = req as FloodRequest<{Body: SetTorrentsPriorityOptions}>;

    try {
      const response = await request.services.clientGatewayService.setTorrentsPriority(request.body);
      request.services.torrentService.fetchTorrentList();
      return reply.status(200).send(response);
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
    }
  });

  /**
   * PATCH /api/torrents/sequential
   * @summary Sets sequential mode of torrents.
   * @tags Torrents
   * @security User
   * @param {SetTorrentsSequentialOptions} request.body.required - options - application/json
   * @return {object} 200 - success response - application/json
   * @return {Error} 500 - failure response - application/json
   */
  fastify.patch<{
    Body: SetTorrentsSequentialOptions;
  }>('/sequential', async (req, reply) => {
    const request = req as FloodRequest<{Body: SetTorrentsSequentialOptions}>;

    try {
      const response = await request.services.clientGatewayService.setTorrentsSequential(request.body);
      request.services.torrentService.fetchTorrentList();
      return reply.status(200).send(response);
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
    }
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
  typedFastify.patch<{
    Body: SetTorrentsTagsOptions;
  }>(
    '/tags',
    {
      schema: {
        body: setTorrentsTagsSchema,
      },
    },
    async (req, reply) => {
      const request = req as FloodRequest<{Body: SetTorrentsTagsOptions}>;

      try {
        const response = await request.services.clientGatewayService.setTorrentsTags(request.body);
        request.services.torrentService.fetchTorrentList();
        return reply.status(200).send(response);
      } catch (error) {
        const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
        return reply.status(500).send({code, message});
      }
    },
  );

  /**
   * PATCH /api/torrents/trackers
   * @summary Sets trackers of torrents.
   * @tags Torrents
   * @security User
   * @param {SetTorrentsTrackersOptions} request.body.required - options - application/json
   * @return {object} 200 - success response - application/json
   * @return {Error} 500 - failure response - application/json
   */
  fastify.patch<{
    Body: SetTorrentsTrackersOptions;
  }>('/trackers', async (req, reply) => {
    const request = req as FloodRequest<{Body: SetTorrentsTrackersOptions}>;

    try {
      const response = await request.services.clientGatewayService.setTorrentsTrackers(request.body);
      request.services.torrentService.fetchTorrentList();
      return reply.status(200).send(response);
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
    }
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
  fastify.get<{
    Params: {hashes: string};
  }>(
    '/:hashes/metainfo',
    {
      ...(rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 60,
      }) ?? {}),
    },
    async (req, reply) => {
      const request = req as FloodRequest<{Params: {hashes: string}}>;
      const hashes: Array<string> = request.params.hashes?.split(',').map((hash) => sanitize(hash));
      if (!Array.isArray(hashes) || hashes?.length < 1) {
        return reply.status(422).send(new Error('Hash not provided.'));
      }

      const {path: sessionDirectory, case: torrentCase} =
        (await request.services.clientGatewayService.getClientSessionDirectory().catch(() => undefined)) || {};

      if (sessionDirectory == null) {
        return reply.status(500).send(new Error('Failed to get session directory.'));
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
          return reply.status(404).send({code: err.code, message: err.message});
        }
        return reply.status(500).send({
          code: err.code,
          message: `Failed to access torrent files: ${e}`,
        });
      }

      if (hashes.length < 2) {
        reply.header('Content-Disposition', contentDisposition(torrentFileNames[0]));
        return reply.send(fs.createReadStream(path.join(sessionDirectory, torrentFileNames[0])));
      }

      reply.header('Content-Disposition', contentDisposition(`torrents-${Date.now()}.tar`));

      return reply.send(
        tar.pack(sessionDirectory, {
          entries: torrentFileNames,
          strict: true,
          dereference: false,
        }),
      );
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
  fastify.get<{
    Params: {hash: string};
  }>('/:hash/contents', async (req, reply) => {
    const request = req as FloodRequest<{Params: {hash: string}}>;

    try {
      const contents = await request.services.clientGatewayService.getTorrentContents(request.params.hash);
      return reply.status(200).send(contents);
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
    }
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
  fastify.patch<{
    Params: {hash: string};
    Body: SetTorrentContentsPropertiesOptions;
  }>('/:hash/contents', async (req, reply) => {
    const request = req as FloodRequest<{Params: {hash: string}; Body: SetTorrentContentsPropertiesOptions}>;

    try {
      const response = await request.services.clientGatewayService.setTorrentContentsPriority(
        request.params.hash,
        request.body,
      );
      return reply.status(200).send(response);
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
    }
  });

  /**
   * GET /api/torrents/{hash}/contents/{indices}/token
   * @summary Gets retrieval token of contents of a torrent.
   * @tags Torrent
   * @security User
   * @param {string} hash.path
   * @param {string} indices.path - 'all' or indices of selected contents separated by ','
   * @return {string} 200 - token - text/plain
   */
  fastify.get<{
    Params: {hash: string; indices: string};
    Querystring: {token?: string};
  }>(
    '/:hash/contents/:indices/token',
    {
      ...(rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 200,
      }) ?? {}),
    },
    (req, reply) => {
      const request = req as FloodRequest<{Params: {hash: string; indices: string}; Querystring: {token?: string}}>;

      if (!request.user) {
        return reply.status(500).send({message: 'User is not attached.'});
      }

      const {hash, indices} = request.params;
      return reply.status(200).send(
        getToken<ContentToken>({
          username: request.user.username,
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
  fastify.get<{
    Params: {hash: string; indices: string};
    Querystring: {token?: string};
  }>(
    '/:hash/contents/:indices/data',
    {
      ...(rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 200,
      }) ?? {}),
    },
    async (req, reply) => {
      const request = req as FloodRequest<{Params: {hash: string; indices: string}; Querystring: {token?: string}}>;
      const {hash, indices: stringIndices} = request.params;

      if (request.user != null && request.query.token == null) {
        if (request.headers?.['user-agent']?.includes('Firefox/') !== true) {
          reply.redirect(
            `?token=${getToken<ContentToken>({
              username: request.user.username,
              hash,
              indices: stringIndices,
            })}`,
          );
          return;
        }
      }

      const selectedTorrent = request.services.torrentService.getTorrent(hash);
      if (!selectedTorrent) {
        return reply.status(404).send({error: 'Torrent not found.'});
      }

      try {
        const contents = await request.services.clientGatewayService.getTorrentContents(hash);

        if (!contents || contents.length < 1) {
          return reply.status(404).send({error: 'Torrent contents not found'});
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
          return reply.status(403).send({code, message});
        }

        filePathsToDownload = filePathsToDownload.filter((filePath) => fs.existsSync(filePath));

        if (filePathsToDownload.length < 1 || filePathsToDownload.length !== indices.length) {
          const {code, message} = fileNotFoundError();
          return reply.status(404).send({code, message});
        }

        if (filePathsToDownload.length === 1) {
          const file = filePathsToDownload[0];

          const fileName = path.basename(file);
          const fileExt = path.extname(file);

          let processedType: string = fileExt;
          switch (fileExt) {
            case '.mkv':
              processedType = 'video/webm';
              break;
            case '.flac':
              processedType = 'audio/flac';
              break;
            default:
              break;
          }

          reply.type(processedType);
          reply.header('content-disposition', contentDisposition(fileName, {type: 'inline'}));

          return reply.send(fs.createReadStream(file));
        }

        const archiveRootFolder = sanitizePath(selectedTorrent.directory);
        const relativeFilePaths = filePathsToDownload.map((filePath) =>
          filePath.replace(`${archiveRootFolder}${path.sep}`, ''),
        );

        reply.header('Content-Disposition', contentDisposition(`${selectedTorrent.name}.tar`));

        const tarOptions: tar.PackOptions = {
          strict: true,
          dereference: false,
        };

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

        return reply.send(tarStream);
      } catch (error) {
        const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
        return reply.status(500).send({code, message});
      }
    },
  );

  /**
   * GET /api/torrents/{hash}/details
   * @summary Gets details of a torrent.
   * @tags Torrent
   * @security User
   * @param {string} hash.path
   */
  fastify.get<{
    Params: {hash: string};
  }>('/:hash/details', async (req, reply) => {
    const request = req as FloodRequest<{Params: {hash: string}}>;

    try {
      const contents = request.services.clientGatewayService.getTorrentContents(request.params.hash);
      const peers = request.services.clientGatewayService.getTorrentPeers(request.params.hash);
      const trackers = request.services.clientGatewayService.getTorrentTrackers(request.params.hash);

      await Promise.all([contents, peers, trackers]);

      return reply.status(200).send({
        contents: await contents,
        peers: await peers,
        trackers: await trackers,
      });
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
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
  fastify.get<{
    Params: {hash: string};
  }>(
    '/:hash/mediainfo',
    {
      ...(rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 30,
      }) ?? {}),
    },
    async (req, reply) => {
      const request = req as FloodRequest<{Params: {hash: string}}>;
      const torrentDirectory = request.services.torrentService.getTorrent(request.params.hash)?.directory;
      const torrentContents = await request.services.clientGatewayService
        .getTorrentContents(request.params.hash)
        .catch(() => undefined);

      if (torrentDirectory == null || torrentContents == null || torrentContents.length < 1) {
        return reply.status(404).send({message: 'Failed to fetch info of torrent.'});
      }

      try {
        let torrentContentPaths = torrentContents?.map((content) =>
          sanitizePath(path.join(torrentDirectory, content.path)),
        );

        torrentContentPaths = await asyncFilter(torrentContentPaths, (contentPath) => isAllowedPathAsync(contentPath));
        if (torrentContentPaths.length < 1) {
          const {code, message} = accessDeniedError();
          return reply.status(403).send({code, message});
        }

        torrentContentPaths = await asyncFilter(torrentContentPaths, (contentPath) => existAsync(contentPath));
        if (torrentContentPaths.length < 1) {
          const {code, message} = fileNotFoundError();
          return reply.status(404).send({code, message});
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
          return reply.status(200).send({
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
              return reply.status(500).send({code: error.code, message: error.message});
            }

            return reply.status(200).send({output: stdout});
          },
        );

        request.raw.on('close', () => mediainfoProcess.kill('SIGTERM'));

        return reply;
      } catch (error) {
        const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
        return reply.status(500).send({code, message});
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
  fastify.get<{
    Params: {hash: string};
  }>('/:hash/peers', async (req, reply) => {
    const request = req as FloodRequest<{Params: {hash: string}}>;

    try {
      const peers = await request.services.clientGatewayService.getTorrentPeers(request.params.hash);
      return reply.status(200).send(peers);
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
    }
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
  fastify.get<{
    Params: {hash: string};
  }>('/:hash/trackers', async (req, reply) => {
    const request = req as FloodRequest<{Params: {hash: string}}>;

    try {
      const trackers = await request.services.clientGatewayService.getTorrentTrackers(request.params.hash);
      return reply.status(200).send(trackers);
    } catch (error) {
      const {code, message} = (error as {code?: unknown; message?: string}) ?? {};
      return reply.status(500).send({code, message});
    }
  });
};

export default torrentsRoutes;
