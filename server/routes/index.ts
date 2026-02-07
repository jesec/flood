import fs from 'node:fs';
import path from 'node:path';

import fastifyCompress from '@fastify/compress';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySSE from '@fastify/sse';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import type {FastifyError, FastifyInstance, FastifyReply} from 'fastify';
import {jsonSchemaTransform, serializerCompiler, validatorCompiler} from 'fastify-type-provider-zod';
import morgan from 'morgan';
import {createServerPaths} from 'server/config/paths';

import config from '../../config';
import packageJson from '../../package.json';
import Users from '../models/Users';
import apiRoutes from './api';
import swaggerRoutes from './swagger';

const constructRoutes = async (fastify: FastifyInstance<any, any, any, any>) => {
  const {appDist} = createServerPaths();
  await Users.bootstrapServicesForAllUsers();

  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  const servedPath = config.baseURI.endsWith('/') ? config.baseURI : `${config.baseURI}/`;

  fastify.setErrorHandler((error: FastifyError, _request, reply) => {
    if (reply.sent) {
      return;
    }

    const statusCode = error.statusCode ?? 500;

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
  await fastify.register(fastifySSE);
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Flood API',
        version: packageJson.version,
      },
      components: {
        securitySchemes: {
          User: {
            type: 'apiKey',
            in: 'cookie',
            name: 'jwt',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

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
    const embeddedAssets = typeof __FLOOD_EMBEDDED_ASSETS__ === 'undefined' ? undefined : __FLOOD_EMBEDDED_ASSETS__;

    const decodeAssetPath = (rawPath: string): string => {
      try {
        return decodeURIComponent(rawPath);
      } catch {
        return rawPath;
      }
    };

    const getEmbeddedAsset = (assetPath: string) => {
      if (!embeddedAssets) {
        return undefined;
      }

      const normalizedPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
      return embeddedAssets[normalizedPath];
    };

    const sendEmbedded = (assetPath: string, reply: FastifyReply) => {
      const asset = getEmbeddedAsset(assetPath);
      if (!asset) {
        return false;
      }

      const isIndexHtml = assetPath === 'index.html' || assetPath === '/index.html';

      if (isIndexHtml) {
        reply.headers({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Expires: '0',
          Pragma: 'no-cache',
          'content-type': 'text/html; charset=UTF-8',
        });
      } else {
        reply.header('content-type', asset.type);
        reply.header('Cache-Control', 'public, max-age=31536000, immutable');
      }

      reply.send(Buffer.from(asset.bodyBase64, 'base64'));
      return true;
    };

    if (embeddedAssets) {
      const sendIndex = (_req: unknown, res: FastifyReply) => {
        if (!sendEmbedded('index.html', res)) {
          res.callNotFound();
        }
      };

      fastify.get(servedPath, sendIndex);
      fastify.get(`${servedPath}index.html`, sendIndex);
      fastify.get(`${servedPath}login`, sendIndex);
      fastify.get(`${servedPath}register`, sendIndex);
      fastify.get(`${servedPath}overview`, sendIndex);

      fastify.get(`${servedPath}*`, (request, reply) => {
        const pathname = new URL(request.url, 'http://localhost').pathname;
        if (!pathname.startsWith(servedPath)) {
          reply.callNotFound();
          return;
        }

        const relativePath = decodeAssetPath(pathname.slice(servedPath.length));

        if (
          relativePath === '' ||
          relativePath === '/' ||
          relativePath === 'login' ||
          relativePath === 'register' ||
          relativePath === 'overview'
        ) {
          sendIndex(request, reply);
          return;
        }

        if (relativePath.startsWith('api/') || relativePath === 'api' || relativePath === 'openapi.json') {
          reply.callNotFound();
          return;
        }

        if (!sendEmbedded(relativePath, reply)) {
          reply.callNotFound();
        }
      });
    } else {
      await fastify.register(fastifyStatic, {root: appDist, prefix: servedPath, etag: false});

      const html = fs.readFileSync(path.join(appDist, 'index.html'), {
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
  }

  await fastify.register(swaggerRoutes, {servedPath});
  await fastify.register(apiRoutes, {prefix: `${servedPath}api`});
};

export default constructRoutes;
