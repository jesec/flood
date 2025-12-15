import fs from 'node:fs';
import path from 'node:path';

import {contentTokenSchema} from '@shared/schema/api/torrents';
import type {DirectoryListQuery, DirectoryListResponse, SetFloodSettingsOptions} from '@shared/types/api/index';
import type {FloodSettings} from '@shared/types/FloodSettings';
import type {NotificationFetchOptions, NotificationState} from '@shared/types/Notification';
import type {FastifyInstance} from 'fastify';

import appendUserServices from '../../middleware/appendUserServices';
import clientActivityStream from '../../middleware/clientActivityStream';
import eventStream from '../../middleware/eventStream';
import Users from '../../models/Users';
import {verifyToken} from '../../util/authUtil';
import {accessDeniedError, isAllowedPath, sanitizePath} from '../../util/fileUtil';
import authRoutes from './auth';
import clientRoutes from './client';
import feedMonitorRoutes from './feed-monitor';
import torrentsRoutes from './torrents';

const apiRoutes = async (fastify: FastifyInstance) => {
  fastify.register(authRoutes, {prefix: '/auth'});

  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', async (request, reply) => {
      if (
        request.routerPath === '/torrents/:hash/contents/:indices/data' &&
        typeof (request.query as {token?: string}).token === 'string'
      ) {
        const {token} = request.query as {token: string};
        const payload = token !== '' ? await verifyToken(token).catch(() => undefined) : null;

        if (payload != null) {
          const parsedResult = contentTokenSchema.safeParse(payload);
          if (parsedResult.success) {
            const {username, hash: authorizedHash, indices: authorizedIndices, iat} = parsedResult.data;
            const {hash: requestedHash, indices: requestedIndices} = request.params as {
              hash?: string;
              indices?: string;
            };

            if (
              typeof username === 'string' &&
              typeof authorizedHash === 'string' &&
              typeof authorizedIndices === 'string' &&
              requestedHash === authorizedHash &&
              requestedIndices === authorizedIndices
            ) {
              const user = await Users.lookupUser(username);
              if (user != null && user.timestamp <= iat + 10) {
                request.user = user;
                const response = appendUserServices(request, reply);
                if (response != null) {
                  return;
                }
              }
            }
          }
        }
      }

      await protectedRoutes.authenticate(request, reply);
    });

    protectedRoutes.register(clientRoutes, {prefix: '/client'});
    protectedRoutes.register(feedMonitorRoutes, {prefix: '/feed-monitor'});
    protectedRoutes.register(torrentsRoutes, {prefix: '/torrents'});

    protectedRoutes.get('/activity-stream', async (request, reply) => {
      eventStream(request, reply);
      await clientActivityStream(request, reply);
    });

    protectedRoutes.get<{
      Reply: DirectoryListResponse | {code: string | number; message: string};
      Querystring: DirectoryListQuery;
    }>('/directory-list', async (request, reply) => {
      const {path: inputPath} = request.query;

      if (typeof inputPath !== 'string' || !inputPath) {
        reply.status(422).send({code: 'EINVAL', message: 'Invalid argument'});
        return;
      }

      const resolvedPath = sanitizePath(inputPath);
      if (!isAllowedPath(resolvedPath)) {
        const {code, message} = accessDeniedError();
        reply.status(403).send({code, message});
        return;
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
          reply.status(404).send({code, message});
          return;
        } else if (code === 'EACCES') {
          reply.status(403).send({code, message});
          return;
        } else {
          reply.status(500).send({code, message});
          return;
        }
      }

      reply.status(200).send({
        path: resolvedPath,
        separator: path.sep,
        directories,
        files,
      });
    });

    protectedRoutes.get('/history', async (request, reply) => {
      request.services.historyService.getHistory().then(
        (snapshot) => {
          reply.send(snapshot);
        },
        ({code, message}) => {
          reply.status(500).send({code, message});
        },
      );
    });

    protectedRoutes.get<{
      Reply: NotificationState | {code: number; message: string};
      Querystring: NotificationFetchOptions;
    }>('/notifications', (request, reply) =>
      request.services.notificationService.getNotifications(request.query).then(
        (notifications) => reply.status(200).send(notifications),
        ({code, message}) => reply.status(500).send({code, message}),
      ),
    );

    protectedRoutes.delete('/notifications', (request, reply) => {
      request.services.notificationService.clearNotifications().then(
        () => {
          reply.status(200).send();
        },
        ({code, message}) => {
          reply.status(500).send({code, message});
        },
      );
    });

    protectedRoutes.get('/settings', (request, reply) =>
      request.services.settingService.get(null).then(
        (settings) => reply.status(200).send(settings),
        ({code, message}) => reply.status(500).send({code, message}),
      ),
    );

    protectedRoutes.get<{Params: {property: keyof FloodSettings}}>('/settings/:property', (request, reply) =>
      request.services.settingService.get(request.params.property).then(
        (setting) => reply.status(200).send(setting),
        ({code, message}) => reply.status(500).send({code, message}),
      ),
    );

    protectedRoutes.patch<{Body: SetFloodSettingsOptions}>('/settings', (request, reply) =>
      request.services.settingService.set(request.body).then(
        (savedSettings) => reply.status(200).send(savedSettings),
        ({code, message}) => reply.status(500).send({code, message}),
      ),
    );
  });
};

export default apiRoutes;
