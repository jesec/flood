import fs from 'node:fs';
import path from 'node:path';

import {notificationStateSchema} from '@shared/schema/Notification';
import {transferHistorySchema} from '@shared/schema/TransferData';
import type {DirectoryListQuery, DirectoryListResponse, SetFloodSettingsOptions} from '@shared/types/api/index';
import type {FloodSettings} from '@shared/types/FloodSettings';
import type {NotificationFetchOptions} from '@shared/types/Notification';
import type {FastifyInstance, FastifyReply} from 'fastify';
import {ZodTypeProvider} from 'fastify-type-provider-zod';

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

    protectedRoutes.get('/activity-stream', {sse: true}, async (req, reply) => clientActivityStream(req, reply));

    protectedRoutes.get<{
      Querystring: DirectoryListQuery;
    }>('/directory-list', async (req, reply): Promise<FastifyReply> => {
      const {path: inputPath} = req.query;

      if (typeof inputPath !== 'string' || !inputPath) {
        return reply.status(422).send({code: 'EINVAL', message: 'Invalid argument'});
      }

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
        const {code, message} = e as NodeJS.ErrnoException;
        if (code === 'ENOENT') {
          return reply.status(404).send({code, message});
        } else if (code === 'EACCES') {
          return reply.status(403).send({code, message});
        } else {
          return reply.status(500).send({code, message});
        }
      }

      return reply.status(200).send({
        path: resolvedPath,
        separator: path.sep,
        directories,
        files,
      } satisfies DirectoryListResponse);
    });

    typedProtectedRoutes.get(
      '/history',
      {
        schema: {
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

    typedProtectedRoutes.get<{
      Querystring: NotificationFetchOptions;
    }>(
      '/notifications',
      {
        schema: {
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

    protectedRoutes.delete('/notifications', async (request, reply: FastifyReply) => {
      const authedContext = getAuthedContext(request);
      await authedContext.services.notificationService.clearNotifications();
      reply.status(200).send();
    });

    protectedRoutes.get('/settings', async (request, reply: FastifyReply) => {
      const authedContext = getAuthedContext(request);
      const settings = await authedContext.services.settingService.get(null);
      reply.status(200).send(settings);
    });

    protectedRoutes.get<{
      Params: {property: keyof FloodSettings};
    }>('/settings/:property', async (request, reply: FastifyReply) => {
      const authedContext = getAuthedContext(request);
      const setting = await authedContext.services.settingService.get(request.params.property);
      reply.status(200).send(setting);
    });

    protectedRoutes.patch<{
      Body: SetFloodSettingsOptions;
    }>('/settings', async (request, reply: FastifyReply) => {
      const authedContext = getAuthedContext(request);
      const savedSettings = await authedContext.services.settingService.set(request.body);
      reply.status(200).send(savedSettings);
    });
  });
};

export default apiRoutes;
