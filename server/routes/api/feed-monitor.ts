import {
  addFeedSchema,
  addRuleSchema,
  feedIdOptionalParamSchema,
  feedIdParamSchema,
  feedItemsQuerySchema,
  modifyFeedSchema,
} from '@shared/schema/api/feed-monitor';
import type {FastifyInstance} from 'fastify';
import {ZodTypeProvider} from 'fastify-type-provider-zod';
import {z} from 'zod';

import {accessDeniedError, isAllowedPath, sanitizePath} from '../../util/fileUtil';
import {getAuthedContext} from './requestContext';

const feedMonitorRoutes = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();
  const errorResponseSchema = z
    .object({
      code: z.string().optional(),
      message: z.string().optional(),
    })
    .strict();

  typedFastify.get(
    '/',
    {
      schema: {
        summary: 'Get feeds and rules',
        description: 'Fetch all feeds and rules.',
        tags: ['Feeds'],
        security: [{User: []}],
        response: {
          200: z.unknown(),
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      const {services} = authedContext;
      return services.feedService.getAll();
    },
  );

  typedFastify.delete(
    '/:id',
    {
      schema: {
        summary: 'Delete feed',
        description: 'Remove a feed by id.',
        tags: ['Feeds'],
        security: [{User: []}],
        params: feedIdParamSchema,
        response: {
          200: z.unknown(),
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      const {services} = authedContext;
      return services.feedService.removeItem(request.params.id);
    },
  );

  typedFastify.get(
    '/feeds/:id?',
    {
      schema: {
        summary: 'Get feeds',
        description: 'Fetch feeds, optionally filtered by id.',
        tags: ['Feeds'],
        security: [{User: []}],
        params: feedIdOptionalParamSchema,
        response: {
          200: z.unknown(),
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      const {services} = authedContext;
      return services.feedService.getFeeds(request.params.id);
    },
  );

  typedFastify.put(
    '/feeds',
    {
      schema: {
        summary: 'Add feed',
        description: 'Add a new feed.',
        tags: ['Feeds'],
        security: [{User: []}],
        body: addFeedSchema,
        response: {
          200: z.unknown(),
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      const {services} = authedContext;
      return services.feedService.addFeed(request.body);
    },
  );

  typedFastify.patch(
    '/feeds/:id',
    {
      schema: {
        summary: 'Modify feed',
        description: 'Update a feed by id.',
        tags: ['Feeds'],
        security: [{User: []}],
        body: modifyFeedSchema,
        params: feedIdParamSchema,
        response: {
          200: z.unknown(),
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      const {services} = authedContext;
      return services.feedService.modifyFeed(request.params.id, request.body);
    },
  );

  typedFastify.get(
    '/feeds/:id/items',
    {
      schema: {
        summary: 'Get feed items',
        description: 'Fetch items for a feed by id.',
        tags: ['Feeds'],
        security: [{User: []}],
        params: feedIdParamSchema,
        querystring: feedItemsQuerySchema,
        response: {
          200: z.unknown(),
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      const {services} = authedContext;
      return services.feedService.getItems(request.params.id, request.query.search ?? '');
    },
  );

  typedFastify.get(
    '/rules',
    {
      schema: {
        summary: 'Get rules',
        description: 'Fetch all rules.',
        tags: ['Feeds'],
        security: [{User: []}],
        response: {
          200: z.unknown(),
        },
      },
    },
    async (request) => {
      const authedContext = getAuthedContext(request);
      const {services} = authedContext;
      return services.feedService.getRules();
    },
  );

  typedFastify.put(
    '/rules',
    {
      schema: {
        summary: 'Add rule',
        description: 'Add a new rule for feeds.',
        tags: ['Feeds'],
        security: [{User: []}],
        body: addRuleSchema,
        response: {
          200: z.unknown(),
          403: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const authedContext = getAuthedContext(request);
      const {services} = authedContext;
      let sanitizedPath: string | null = null;
      try {
        sanitizedPath = sanitizePath(request.body.destination);
        if (!isAllowedPath(sanitizedPath)) {
          const {code, message} = accessDeniedError();
          reply.status(403).send({code, message});
          return;
        }
      } catch ({code, message}) {
        reply.status(403).send({code, message});
        return;
      }

      const rule = await services.feedService.addRule({
        ...request.body,
        destination: sanitizedPath,
      });
      return rule;
    },
  );
};

export default feedMonitorRoutes;
