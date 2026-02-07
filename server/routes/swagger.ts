import type {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {z} from 'zod';

const swaggerHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Flood API</title>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"
    />
    <style>
      html {
        box-sizing: border-box;
        overflow-y: scroll;
      }

      *,
      *:before,
      *:after {
        box-sizing: inherit;
      }

      body {
        margin: 0;
        background: #fafafa;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>

    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: '__OPENAPI_URL__',
          dom_id: '#swagger-ui',
          deepLinking: true,
          docExpansion: 'list',
          operationsSorter: 'alpha',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'BaseLayout',
        });
      };
    </script>
  </body>
</html>
`;

const swaggerRoutes = async (fastify: FastifyInstance) => {
  fastify.get(
    '/openapi.json',
    {
      schema: {
        response: {
          200: z.unknown(),
        },
      },
    },
    async () => fastify.swagger(),
  );

  fastify.get(
    '/api/openapi.json',
    {
      schema: {
        response: {
          200: z.unknown(),
        },
      },
    },
    async () => fastify.swagger(),
  );

  const openApiUrl = '../openapi.json';
  const body = swaggerHtml.replace('__OPENAPI_URL__', openApiUrl);

  const sendSwaggerUi = async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.type('text/html; charset=UTF-8').send(body);
  };

  fastify.get('/api/docs', async (_request, reply) => {
    reply.redirect('/api/docs/', 302);
  });

  fastify.get(
    '/api/docs/',
    {
      config: {
        compress: false,
      },
    },
    sendSwaggerUi,
  );
};

export default swaggerRoutes;
