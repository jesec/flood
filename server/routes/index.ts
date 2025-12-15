import fs from 'node:fs';
import path from 'node:path';

import fastifyCompress from '@fastify/compress';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import paths from '@shared/config/paths';
import type {FastifyError, FastifyInstance, FastifyReply} from 'fastify';
import morgan from 'morgan';

import config from '../../config';
import Users from '../models/Users';
import apiRoutes from './api';

const constructRoutes = async (fastify: FastifyInstance) => {
  await Users.bootstrapServicesForAllUsers();

  const servedPath = config.baseURI.endsWith('/') ? config.baseURI : `${config.baseURI}/`;

  fastify.setErrorHandler((error: FastifyError, _request, reply) => {
    const statusCode = error.statusCode ?? 500;

    if (reply.sent) {
      return;
    }

    reply.status(statusCode).send({
      code: error.code ?? 'INTERNAL_SERVER_ERROR',
      message: error.message ?? 'Internal server error',
    });
  });

  if (process.env.NODE_ENV !== 'test') {
    fastify.addHook('onRequest', (request, reply, done) => {
      morgan('dev')(request.raw, reply.raw, done);
    });
  }

  await fastify.register(fastifyCookie);
  await fastify.register(fastifyCompress);

  if (!config.disableRateLimit) {
    await fastify.register(fastifyRateLimit, {
      global: false,
    });
  }

  fastify.addContentTypeParser('application/x-www-form-urlencoded', {parseAs: 'buffer'}, (_request, body, done) => {
    try {
      const parsedBody = Object.fromEntries(new URLSearchParams(body.toString()));
      done(null, parsedBody);
    } catch (err) {
      done(err as Error, undefined);
    }
  });

  if (config.serveAssets !== false) {
    await fastify.register(fastifyStatic, {root: paths.appDist, prefix: servedPath, etag: false});

    const html = fs.readFileSync(path.join(paths.appDist, 'index.html'), {
      encoding: 'utf8',
    });

    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Expires: '0',
      Pragma: 'no-cache',
      'content-type': 'text/html; charset=UTF-8',
    };

    const sendIndex = (_req: unknown, res: FastifyReply) => {
      res.headers(headers);
      res.send(html);
    };

    fastify.get(`${servedPath}login`, sendIndex);
    fastify.get(`${servedPath}register`, sendIndex);
    fastify.get(`${servedPath}overview`, sendIndex);
  }

  await fastify.register(apiRoutes, {prefix: `${servedPath}api`});
};

export default constructRoutes;
