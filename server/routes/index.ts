import fastifyCompress from '@fastify/compress';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySSE from '@fastify/sse';
import swagger from '@fastify/swagger';
import type {FastifyError, FastifyInstance} from 'fastify';
import {jsonSchemaTransform, validatorCompiler} from 'fastify-type-provider-zod';
import morgan from 'morgan';

import config from '../../config';
import packageJson from '../../package.json';
import Users from '../models/Users';
import apiRoutes from './api';
import {registerClientAppAssetsRoutes} from './clientAppAssets';
import swaggerRoutes from './swagger';

const constructRoutes = async (fastify: FastifyInstance<any, any, any, any>) => {
  await Users.bootstrapServicesForAllUsers();

  fastify.setValidatorCompiler(validatorCompiler);
  // fastify.setSerializerCompiler(serializerCompiler);
  fastify.setSerializerCompiler(() => {
    return (data) => JSON.stringify(data);
  });

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

  // enforce `/` at end
  const routePrefix = servedPath.endsWith('/') ? servedPath : servedPath + '/';
  await fastify.register(registerScopedRoutes, {
    prefix: routePrefix,
  });
};

const registerScopedRoutes = async (scoped: FastifyInstance) => {
  await registerClientAppAssetsRoutes(scoped);
  await scoped.register(swaggerRoutes);
  await scoped.register(apiRoutes, {prefix: '/api/'});
};

export default constructRoutes;
