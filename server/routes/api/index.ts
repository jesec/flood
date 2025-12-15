import fs from 'node:fs';
import path from 'node:path';

import type {UserInDatabase} from '@shared/schema/Auth';
import type {DirectoryListQuery, DirectoryListResponse, SetFloodSettingsOptions} from '@shared/types/api/index';
import type {FloodSettings} from '@shared/types/FloodSettings';
import type {NotificationFetchOptions, NotificationState} from '@shared/types/Notification';
import type {FastifyInstance, FastifyReply, FastifyRequest, RouteGenericInterface} from 'fastify';

import appendUserServices from '../../middleware/appendUserServices';
import {authenticateHook} from '../../middleware/authenticate';
import clientActivityStream from '../../middleware/clientActivityStream';
import type {ServiceInstances} from '../../services';
import {accessDeniedError, isAllowedPath, sanitizePath} from '../../util/fileUtil';
import authRoutes from './auth';
import clientRoutes from './client';
import feedMonitorRoutes from './feed-monitor';
import torrentsRoutes from './torrents';

type AuthedRequest<T extends RouteGenericInterface = RouteGenericInterface> = FastifyRequest<T> & {
  services: ServiceInstances;
  user: UserInDatabase;
};

const apiRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook('onSend', async (_req, reply, payload) => {
    if (reply.getHeader('content-type') == null) {
      reply.type('application/json; charset=utf-8');
    }

    return payload;
  });

  await fastify.register(authRoutes, {prefix: '/auth'});

  await fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', authenticateHook);
    protectedRoutes.addHook('preHandler', appendUserServices);

    protectedRoutes.register(clientRoutes, {prefix: '/client'});
    protectedRoutes.register(feedMonitorRoutes, {prefix: '/feed-monitor'});
    protectedRoutes.register(torrentsRoutes, {prefix: '/torrents'});

    protectedRoutes.get('/activity-stream', async (req, reply) => clientActivityStream(req, reply));

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

    protectedRoutes.get('/history', (req, reply: FastifyReply) => {
      const authedReq = req as AuthedRequest;
      return authedReq.services.historyService.getHistory().then(
        (snapshot) => {
          reply.send(snapshot);
        },
        ({code, message}) => {
          reply.status(500).send({code, message});
        },
      );
    });

    protectedRoutes.get<{
      Querystring: NotificationFetchOptions;
      Reply: NotificationState | {code: number; message: string};
    }>('/notifications', async (req, reply: FastifyReply) => {
      const authedReq = req as AuthedRequest<{Querystring: NotificationFetchOptions}>;
      await authedReq.services.notificationService.getNotifications(req.query).then(
        (notifications) => reply.status(200).send(notifications),
        ({code, message}) => reply.status(500).send({code, message}),
      );
    });

    protectedRoutes.delete('/notifications', (req, reply: FastifyReply) => {
      const authedReq = req as AuthedRequest;
      authedReq.services.notificationService.clearNotifications().then(
        () => {
          reply.status(200).send();
        },
        ({code, message}) => {
          reply.status(500).send({code, message});
        },
      );
    });

    protectedRoutes.get('/settings', async (req, reply: FastifyReply) => {
      const authedReq = req as AuthedRequest;
      return authedReq.services.settingService.get(null).then(
        (settings) => reply.status(200).send(settings),
        ({code, message}) => reply.status(500).send({code, message}),
      );
    });

    protectedRoutes.get<{
      Params: {property: keyof FloodSettings};
    }>('/settings/:property', async (req, reply: FastifyReply) => {
      const authedReq = req as AuthedRequest<{Params: {property: keyof FloodSettings}}>;
      return authedReq.services.settingService.get(authedReq.params.property).then(
        (setting) => reply.status(200).send(setting),
        ({code, message}) => reply.status(500).send({code, message}),
      );
    });

    protectedRoutes.patch<{
      Body: SetFloodSettingsOptions;
    }>('/settings', async (req, reply: FastifyReply) => {
      const authedReq = req as AuthedRequest<{Body: SetFloodSettingsOptions}>;
      return authedReq.services.settingService.set(authedReq.body).then(
        (savedSettings) => reply.status(200).send(savedSettings),
        ({code, message}) => reply.status(500).send({code, message}),
      );
    });
  });
};

export default apiRoutes;
