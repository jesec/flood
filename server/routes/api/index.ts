import fs from 'node:fs';
import path from 'node:path';

import {
  directoryListQuerySchema,
  notificationFetchQuerySchema,
  setFloodSettingsSchema,
  settingPropertyParamSchema,
} from '@shared/schema/api/index';
import {floodSettingsSchema} from '@shared/schema/FloodSettings';
import {notificationStateSchema} from '@shared/schema/Notification';
import {transferHistorySchema} from '@shared/schema/TransferData';
import type {DirectoryListResponse} from '@shared/types/api/index';
import type {FastifyInstance} from 'fastify';
import {ZodTypeProvider} from 'fastify-type-provider-zod';
import {z} from 'zod';

import appendUserServices from '../../middleware/appendUserServices';
import {authenticateHook} from '../../middleware/authenticate';
import clientActivityStream from '../../middleware/clientActivityStream';
import {accessDeniedError, isAllowedPath, sanitizePath} from '../../util/fileUtil';
import authRoutes from './auth';
import clientRoutes from './client';
import feedMonitorRoutes from './feed-monitor';
import {getAuthedContext} from './requestContext';
import torrentsRoutes from './torrents';

const apiRoutes = async (fastify: FastifyInstance) => {
  const errorResponseSchema = z
    .object({
      code: z.string().optional(),
      message: z.string().optional(),
    })
    .strict();
  fastify.addHook('onSend', async (_req, reply, payload) => {
    if (reply.getHeader('content-type') == null) {
      reply.type('application/json; charset=utf-8');
    }

    return payload;
  });

  await fastify.register(authRoutes, {prefix: '/auth'});

  await fastify.register(async (protectedRoutes) => {
    const typedProtectedRoutes = protectedRoutes.withTypeProvider<ZodTypeProvider>();
    protectedRoutes.addHook('preHandler', authenticateHook);
    protectedRoutes.addHook('preHandler', appendUserServices);

    protectedRoutes.register(clientRoutes, {prefix: '/client'});
    protectedRoutes.register(feedMonitorRoutes, {prefix: '/feed-monitor'});
    protectedRoutes.register(torrentsRoutes, {prefix: '/torrents'});

    protectedRoutes.get(
      '/activity-stream',
      {
        sse: true,
        schema: {
          summary: 'Activity stream',
          description: 'Stream torrent activity updates via Server-Sent Events.',
          tags: ['Activity'],
          security: [{User: []}],
        },
      },
      async (req, reply) => clientActivityStream(req, reply),
    );

    typedProtectedRoutes.get(
      '/directory-list',
      {
        schema: {
          summary: 'List directories',
          description: 'List subdirectories and files for a path.',
          tags: ['Files'],
          security: [{User: []}],
          querystring: directoryListQuerySchema,
          response: {
            200: z
              .object({
                path: z.string(),
                separator: z.string(),
                directories: z.array(z.string()),
                files: z.array(z.string()),
              })
              .strict(),
            403: errorResponseSchema,
            404: errorResponseSchema,
          },
        },
      },
      async (req, reply) => {
        const {path: inputPath} = req.query;

        const resolvedPath = sanitizePath(inputPath);
        if (!isAllowedPath(resolvedPath)) {
          const {code, message} = accessDeniedError();
          return reply.status(403).send({code, message});
        }

        const directories: Array<string> = [];
        const files: Array<string> = [];

        try {
          const dirents = await fs.promises.readdir(resolvedPath, {withFileTypes: true});
          await Promise.all(
            dirents.map(async (dirent) => {
              if (dirent.isDirectory()) {
                directories.push(dirent.name);
              } else if (dirent.isFile()) {
                files.push(dirent.name);
              } else if (dirent.isSymbolicLink()) {
                const stats = await fs.promises.stat(path.join(resolvedPath, dirent.name)).catch(() => undefined);
                if (!stats) {
                  // do nothing.
                } else if (stats.isDirectory()) {
                  directories.push(dirent.name);
                } else if (stats.isFile()) {
                  files.push(dirent.name);
                }
              }
            }),
          );
        } catch (e) {
          const err = e as NodeJS.ErrnoException;
          if (err.code === 'ENOENT') {
            return reply.status(404).send({code: err.code, message: err.message});
          }
          if (err.code === 'EACCES') {
            return reply.status(403).send({code: err.code, message: err.message});
          }

          throw err;
        }

        return {
          path: resolvedPath,
          separator: path.sep,
          directories,
          files,
        } satisfies DirectoryListResponse;
      },
    );

    typedProtectedRoutes.get(
      '/history',
      {
        schema: {
          summary: 'Transfer history',
          description: 'Get download/upload transfer history.',
          tags: ['Transfers'],
          security: [{User: []}],
          response: {
            200: transferHistorySchema,
          },
        },
      },
      async (request) => {
        const authedContext = getAuthedContext(request);
        return authedContext.services.historyService.getHistory();
      },
    );

    typedProtectedRoutes.get(
      '/notifications',
      {
        schema: {
          summary: 'Get notifications',
          description: 'Get notifications with optional paging filters.',
          tags: ['Notifications'],
          security: [{User: []}],
          querystring: notificationFetchQuerySchema,
          response: {
            200: notificationStateSchema,
          },
        },
      },
      async (request) => {
        const authedContext = getAuthedContext(request);
        return authedContext.services.notificationService.getNotifications(request.query);
      },
    );

    protectedRoutes.delete(
      '/notifications',
      {
        schema: {
          summary: 'Clear notifications',
          description: 'Clear all notifications.',
          tags: ['Notifications'],
          security: [{User: []}],
          response: {
            200: z.void(),
          },
        },
      },
      async (request) => {
        const authedContext = getAuthedContext(request);
        await authedContext.services.notificationService.clearNotifications();
      },
    );

    protectedRoutes.get(
      '/settings',
      {
        schema: {
          summary: 'Get settings',
          description: 'Get all Flood settings for the current user.',
          tags: ['Settings'],
          security: [{User: []}],
          response: {
            200: floodSettingsSchema,
          },
        },
      },
      async (request) => {
        const authedContext = getAuthedContext(request);
        const settings = await authedContext.services.settingService.get(null);
        return settings;
      },
    );

    typedProtectedRoutes.get(
      '/settings/:property',
      {
        schema: {
          summary: 'Get setting',
          description: 'Get a Flood setting by key.',
          tags: ['Settings'],
          security: [{User: []}],
          params: settingPropertyParamSchema,
          response: {
            200: z.unknown(),
          },
        },
      },
      async (request) => {
        const authedContext = getAuthedContext(request);
        const setting = await authedContext.services.settingService.get(request.params.property);
        return setting;
      },
    );

    typedProtectedRoutes.patch(
      '/settings',
      {
        schema: {
          summary: 'Update settings',
          description: 'Update Flood settings for the current user.',
          tags: ['Settings'],
          security: [{User: []}],
          body: setFloodSettingsSchema,
          // response: {
          // 200: floodSettingsSchema,
          // },
        },
      },
      async (request) => {
        const authedContext = getAuthedContext(request);
        const savedSettings = await authedContext.services.settingService.set(request.body);
        return savedSettings;
      },
    );
  });
};

export default apiRoutes;
