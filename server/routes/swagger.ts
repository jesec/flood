import swaggerUi from '@fastify/swagger-ui';
import type {FastifyInstance} from 'fastify';
import {z} from 'zod';

type SwaggerRouteOptions = {
  servedPath: string;
};

const swaggerRoutes = async (fastify: FastifyInstance, {servedPath}: SwaggerRouteOptions) => {
  fastify.get(
    `${servedPath}openapi.json`,
    {
      schema: {
        response: {
          200: z.unknown(),
        },
      },
    },
    async () => fastify.swagger(),
  );

  await fastify.register(swaggerUi, {
    routePrefix: `${servedPath}api/docs`,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
};

export default swaggerRoutes;
