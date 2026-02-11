import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import type {ContentToken} from '@shared/schema/api/torrents';
import {CreateTorrentOptionsSchema} from '@shared/types/api/torrents';
import contentDisposition from 'content-disposition';
import type {CreateTorrentOptions, TorrentInput} from 'create-torrent';
import type {FastifyInstance} from 'fastify';
import {ZodTypeProvider} from 'fastify-type-provider-zod';
import sanitize from 'sanitize-filename';
import tar, {Pack} from 'tar-fs';
import {strictObject, string, z} from 'zod';

import {
  addTorrentByFileSchema,
  addTorrentByURLSchema,
  checkTorrentsSchema,
  deleteTorrentsSchema,
  moveTorrentsSchema,
  reannounceTorrentsSchema,
  setTorrentContentsPropertiesSchema,
  setTorrentsInitialSeedingSchema,
  setTorrentsPrioritySchema,
  setTorrentsSequentialSchema,
  setTorrentsTagsSchema,
  setTorrentsTrackersSchema,
  startTorrentsSchema,
  stopTorrentsSchema,
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
import {normalizeTorrentUrl} from '@server/util/torrentUrlUtil';
import {rateLimit} from '../utils';
import {getAuthedContext} from './requestContext';

async function createTorrentAsync(input: TorrentInput, option: CreateTorrentOptions): Promise<Buffer> {
  const {default: createTorrent} = await import('create-torrent');

  return new Promise((resolve, reject) => {
    createTorrent(input, option, (error, torrent) => {
      if (error) return reject(error);

      resolve(Buffer.from(torrent!));
    });
  });
}

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
  const hashParamSchema = strictObject({hash: string().min(1)});
  const hashesResponseSchema = z.array(z.string());
  const emptyResponseSchema = z.void();
  const errorResponseSchema = z
    .object({
      code: z.unknown().optional(),
      message: z.string().optional(),
    })
    .strict();
  const torrentDetailsResponseSchema = z
    .object({
      contents: z.unknown(),
      peers: z.unknown(),
      trackers: z.unknown(),
    })
    .strict();
  const mediainfoResponseSchema = z
    .object({
      output: z.string(),
    })
    .strict();

  fastify.get(
    '/',
    {
      schema: {
        summary: 'Get torrent list',
        description: 'Get the list of torrents.',
        tags: ['Torrents'],
        security: [{User: []}],
        response: {
          200: z.unknown(),
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      const data = await authedContext.services.torrentService.fetchTorrentList();
      if (data == null) {
        throw new Error('Failed to fetch torrent list.');
      }
      return data;
    },
  );

  typedFastify.post(
    '/add-urls',
    {
      schema: {
        summary: 'Add torrents by URL',
        description: 'Add torrents by URL.',
        tags: ['Torrents'],
        security: [{User: []}],
        body: addTorrentByURLSchema,
        response: {
          200: hashesResponseSchema,
          202: hashesResponseSchema,
          207: hashesResponseSchema,
          403: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const authedContext = getAuthedContext(request);
      const {urls, cookies, destination, tags, isBasePath, isCompleted, isSequential, isInitialSeeding, start} =
        request.body;

      const normalizedUrls = urls.map((url) => normalizeTorrentUrl(url)) as [string, ...string[]];

      const finalDestination = await getDestination(authedContext.services, {
        destination,
        tags,
      });

      if (finalDestination == null) {
        const {code, message} = accessDeniedError();
        return reply.status(403).send({code, message});
      }

      const response = await authedContext.services.clientGatewayService.addTorrentsByURL({
        urls: normalizedUrls,
        cookies: cookies != null ? cookies : {},
        destination: finalDestination,
        tags: tags ?? [],
        isBasePath: isBasePath ?? false,
        isCompleted: isCompleted ?? false,
        isSequential: isSequential ?? false,
        isInitialSeeding: isInitialSeeding ?? false,
        start: start ?? false,
      });

      authedContext.services.torrentService.fetchTorrentList();
      if (response.length === 0) {
        return reply.status(202).send(response);
      }
      if (response.length < normalizedUrls.length) {
        return reply.status(207).send(response);
      }
      return response;
    },
  );

  typedFastify.post(
    '/add-files',
    {
      schema: {
        summary: 'Add torrents by file',
        description: 'Add torrents by file.',
        tags: ['Torrents'],
        security: [{User: []}],
        body: addTorrentByFileSchema,
        response: {
          200: hashesResponseSchema,
          202: hashesResponseSchema,
          207: hashesResponseSchema,
          403: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const authedContext = getAuthedContext(request);
      const {files, destination, tags, isBasePath, isCompleted, isSequential, isInitialSeeding, start} = request.body;

      const finalDestination = await getDestination(authedContext.services, {
        destination,
        tags,
      });

      if (finalDestination == null) {
        const {code, message} = accessDeniedError();
        return reply.status(403).send({code, message});
      }

      const response = await authedContext.services.clientGatewayService.addTorrentsByFile({
        files,
        destination: finalDestination,
        tags: tags ?? [],
        isBasePath: isBasePath ?? false,
        isCompleted: isCompleted ?? false,
        isSequential: isSequential ?? false,
        isInitialSeeding: isInitialSeeding ?? false,
        start: start ?? false,
      });

      authedContext.services.torrentService.fetchTorrentList();
      if (response.length === 0) {
        return reply.status(202).send(response);
      }
      if (response.length < files.length) {
        return reply.status(207).send(response);
      }
      return response;
    },
  );

  typedFastify.post(
    '/create',
    {
      schema: {
        summary: 'Create torrent',
        description: 'Create a torrent file from a local path.',
        tags: ['Torrents'],
        security: [{User: []}],
        body: CreateTorrentOptionsSchema,
        response: {
          200: z.unknown(),
          403: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const authedContext = getAuthedContext(request);
      const {name, sourcePath, trackers, comment, infoSource, isPrivate, isInitialSeeding, tags, start} = request.body;

      const sanitizedPath = sanitizePath(sourcePath);
      if (!isAllowedPath(sanitizedPath)) {
        const {code, message} = accessDeniedError();
        return reply.status(403).send({code, message});
      }

      const torrentFileName = sanitize(name ?? sanitizedPath.split(path.sep).pop() ?? `${Date.now()}`).concat(
        '.torrent',
      );

      const announceList = trackers?.length > 0 ? trackers.map((tracker) => [tracker]) : undefined;
      const torrent: Buffer = await createTorrentAsync(sanitizedPath, {
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

      await authedContext.services.clientGatewayService
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
    },
  );

  typedFastify.post(
    '/start',
    {
      schema: {
        summary: 'Start torrents',
        description: 'Start torrents by hash list.',
        tags: ['Torrents'],
        security: [{User: []}],
        body: startTorrentsSchema,
        response: {
          200: emptyResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      await authedContext.services.clientGatewayService.startTorrents(request.body);
      authedContext.services.torrentService.fetchTorrentList();
    },
  );

  typedFastify.post(
    '/stop',
    {
      schema: {
        summary: 'Stop torrents',
        description: 'Stop torrents by hash list.',
        tags: ['Torrents'],
        security: [{User: []}],
        body: stopTorrentsSchema,
        response: {
          200: emptyResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      await authedContext.services.clientGatewayService.stopTorrents(request.body);
      authedContext.services.torrentService.fetchTorrentList();
    },
  );

  typedFastify.post(
    '/check-hash',
    {
      schema: {
        summary: 'Check torrent hashes',
        description: 'Recheck torrents by hash list.',
        tags: ['Torrents'],
        security: [{User: []}],
        body: checkTorrentsSchema,
        response: {
          200: emptyResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      await authedContext.services.clientGatewayService.checkTorrents(request.body);
      authedContext.services.torrentService.fetchTorrentList();
    },
  );

  typedFastify.post(
    '/move',
    {
      schema: {
        summary: 'Move torrents',
        description: 'Move torrents to a new destination path.',
        tags: ['Torrents'],
        security: [{User: []}],
        body: moveTorrentsSchema,
        response: {
          200: emptyResponseSchema,
          403: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const authedContext = getAuthedContext(request);
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

      await authedContext.services.clientGatewayService.moveTorrents({
        ...request.body,
        destination: sanitizedPath,
      });
      authedContext.services.torrentService.fetchTorrentList();
    },
  );

  typedFastify.post(
    '/delete',
    {
      schema: {
        summary: 'Delete torrents',
        description: 'Remove torrents and optionally delete data.',
        tags: ['Torrents'],
        security: [{User: []}],
        body: deleteTorrentsSchema,
        response: {
          200: emptyResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      await authedContext.services.clientGatewayService.removeTorrents(request.body);
      authedContext.services.torrentService.fetchTorrentList();
    },
  );

  typedFastify.post(
    '/reannounce',
    {
      schema: {
        summary: 'Reannounce torrents',
        description: 'Reannounce torrents to trackers.',
        tags: ['Torrents'],
        security: [{User: []}],
        body: reannounceTorrentsSchema,
        response: {
          200: emptyResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      await authedContext.services.clientGatewayService.reannounceTorrents(request.body);
      authedContext.services.clientGatewayService.fetchTorrentList();
    },
  );

  typedFastify.patch(
    '/initial-seeding',
    {
      schema: {
        summary: 'Set initial seeding',
        description: 'Set initial seeding mode for torrents.',
        tags: ['Torrents'],
        security: [{User: []}],
        body: setTorrentsInitialSeedingSchema,
        response: {
          200: emptyResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      await authedContext.services.clientGatewayService.setTorrentsInitialSeeding(request.body);
      authedContext.services.torrentService.fetchTorrentList();
    },
  );

  typedFastify.patch(
    '/priority',
    {
      schema: {
        summary: 'Set torrent priority',
        description: 'Set priority for torrents.',
        tags: ['Torrents'],
        security: [{User: []}],
        body: setTorrentsPrioritySchema,
        response: {
          200: emptyResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      await authedContext.services.clientGatewayService.setTorrentsPriority(request.body);
      authedContext.services.torrentService.fetchTorrentList();
    },
  );

  typedFastify.patch(
    '/sequential',
    {
      schema: {
        summary: 'Set torrent sequential mode',
        description: 'Set sequential download mode for torrents.',
        tags: ['Torrents'],
        security: [{User: []}],
        body: setTorrentsSequentialSchema,
        response: {
          200: emptyResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      await authedContext.services.clientGatewayService.setTorrentsSequential(request.body);
      authedContext.services.torrentService.fetchTorrentList();
    },
  );

  typedFastify.patch(
    '/tags',
    {
      schema: {
        summary: 'Set torrent tags',
        description: 'Set tags for torrents.',
        tags: ['Torrents'],
        security: [{User: []}],
        body: setTorrentsTagsSchema,
        response: {
          200: emptyResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      await authedContext.services.clientGatewayService.setTorrentsTags(request.body);
      authedContext.services.torrentService.fetchTorrentList();
    },
  );

  typedFastify.patch(
    '/trackers',
    {
      schema: {
        summary: 'Set torrent trackers',
        description: 'Set trackers for torrents.',
        tags: ['Torrents'],
        security: [{User: []}],
        body: setTorrentsTrackersSchema,
        response: {
          200: emptyResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      await authedContext.services.clientGatewayService.setTorrentsTrackers(request.body);
      authedContext.services.torrentService.fetchTorrentList();
    },
  );

  typedFastify.get(
    '/:hashes/metainfo',
    {
      ...(rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 60,
      }) ?? {}),
      schema: {
        summary: 'Get torrent metainfo',
        description: 'Get meta-info (.torrent) files for torrents.',
        tags: ['Torrents'],
        security: [{User: []}],
        params: strictObject({
          hashes: string().min(1),
        }),
        response: {
          200: z.unknown(),
          404: errorResponseSchema,
          422: z.unknown(),
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const authedContext = getAuthedContext(request);
      const {services} = authedContext;
      const hashes: Array<string> = request.params.hashes?.split(',').map((hash) => sanitize(hash));
      if (!Array.isArray(hashes) || hashes?.length < 1) {
        return reply.status(422).send(new Error('Hash not provided.'));
      }

      const {path: sessionDirectory, case: torrentCase} =
        (await services.clientGatewayService.getClientSessionDirectory().catch(() => undefined)) || {};

      if (sessionDirectory == null) {
        throw new Error('Failed to get session directory.');
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
        throw err;
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

  typedFastify.get(
    '/:hash/contents',
    {
      schema: {
        summary: 'Get torrent contents',
        description: 'Get torrent contents and their properties.',
        tags: ['Torrent'],
        security: [{User: []}],
        params: hashParamSchema,
        response: {
          200: z.unknown(),
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      return authedContext.services.clientGatewayService.getTorrentContents(request.params.hash);
    },
  );

  typedFastify.patch(
    '/:hash/contents',
    {
      schema: {
        summary: 'Update torrent contents',
        description: 'Set properties of torrent contents.',
        tags: ['Torrent'],
        security: [{User: []}],
        params: hashParamSchema,
        body: setTorrentContentsPropertiesSchema,
        response: {
          200: emptyResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      await authedContext.services.clientGatewayService.setTorrentContentsPriority(request.params.hash, request.body);
    },
  );

  typedFastify.get(
    '/:hash/contents/:indices/token',
    {
      ...(rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 200,
      }) ?? {}),
      schema: {
        summary: 'Get torrent content token',
        description: 'Get retrieval token for torrent contents.',
        tags: ['Torrent'],
        security: [{User: []}],
        params: strictObject({
          hash: string().min(1),
          indices: string().min(1),
        }),
        response: {
          200: z.string(),
        },
      },
    },
    (request) => {
      const {hash, indices} = request.params;
      const authedContext = getAuthedContext(request);
      const {user} = authedContext;

      return getToken<ContentToken>({
        username: user.username,
        hash,
        indices,
      });
    },
  );

  typedFastify.get(
    '/:hash/contents/:indices/data',
    {
      ...(rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 200,
      }) ?? {}),
      schema: {
        summary: 'Download torrent contents',
        description: 'Download torrent contents as a stream or archive.',
        tags: ['Torrent'],
        security: [{User: []}],
        params: strictObject({
          hash: string().min(1),
          indices: string().min(1),
        }),
        querystring: strictObject({
          token: string().min(1).optional(),
        }),
        response: {
          200: z.unknown(),
          403: errorResponseSchema,
          404: z.unknown(),
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const {hash, indices: stringIndices} = request.params;
      const authedContext = getAuthedContext(request);
      const {services, user} = authedContext;

      if (request.query.token == null) {
        if (request.headers?.['user-agent']?.includes('Firefox/') !== true) {
          reply.redirect(
            `?token=${getToken<ContentToken>({
              username: user.username,
              hash,
              indices: stringIndices,
            })}`,
          );
          return;
        }
      }

      const selectedTorrent = services.torrentService.getTorrent(hash);
      if (!selectedTorrent) {
        return reply.status(404).send({error: 'Torrent not found.'});
      }

      const contents = await services.clientGatewayService.getTorrentContents(hash);

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
    },
  );

  typedFastify.get(
    '/:hash/details',
    {
      schema: {
        summary: 'Get torrent details',
        description: 'Get contents, peers, and trackers for a torrent.',
        tags: ['Torrent'],
        security: [{User: []}],
        params: hashParamSchema,
        response: {
          200: torrentDetailsResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      const contents = authedContext.services.clientGatewayService.getTorrentContents(request.params.hash);
      const peers = authedContext.services.clientGatewayService.getTorrentPeers(request.params.hash);
      const trackers = authedContext.services.clientGatewayService.getTorrentTrackers(request.params.hash);

      await Promise.all([contents, peers, trackers]);

      return {
        contents: await contents,
        peers: await peers,
        trackers: await trackers,
      };
    },
  );

  typedFastify.get(
    '/:hash/mediainfo',
    {
      ...(rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 30,
      }) ?? {}),
      schema: {
        summary: 'Get torrent mediainfo',
        description: 'Get mediainfo output for torrent contents.',
        tags: ['Torrent'],
        security: [{User: []}],
        params: hashParamSchema,
        response: {
          200: mediainfoResponseSchema,
          403: errorResponseSchema,
          404: z.unknown(),
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const authedContext = getAuthedContext(request);
      const torrentDirectory = authedContext.services.torrentService.getTorrent(request.params.hash)?.directory;
      const torrentContents = await authedContext.services.clientGatewayService
        .getTorrentContents(request.params.hash)
        .catch(() => undefined);

      if (torrentDirectory == null || torrentContents == null || torrentContents.length < 1) {
        return reply.status(404).send({message: 'Failed to fetch info of torrent.'});
      }

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
        return {
          output:
            'no video file found.\nIf this is a error, please create a issue at https://github.com/jesec/flood/issues',
        };
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
    },
  );

  typedFastify.get(
    '/:hash/peers',
    {
      schema: {
        summary: 'Get torrent peers',
        description: 'Get peer list for a torrent.',
        tags: ['Torrent'],
        security: [{User: []}],
        params: hashParamSchema,
        response: {
          200: z.unknown(),
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      return authedContext.services.clientGatewayService.getTorrentPeers(request.params.hash);
    },
  );

  typedFastify.get(
    '/:hash/trackers',
    {
      schema: {
        summary: 'Get torrent trackers',
        description: 'Get tracker list for a torrent.',
        tags: ['Torrent'],
        security: [{User: []}],
        params: hashParamSchema,
        response: {
          200: z.unknown(),
          500: errorResponseSchema,
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      return authedContext.services.clientGatewayService.getTorrentTrackers(request.params.hash);
    },
  );
};

export default torrentsRoutes;
