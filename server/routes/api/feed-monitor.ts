import {
  addFeedSchema,
  addRuleSchema,
  feedIdOptionalParamSchema,
  feedIdParamSchema,
  feedItemsQuerySchema,
  modifyFeedSchema,
} from '@shared/schema/api/feed-monitor';
import type {FastifyInstance, FastifyReply} from 'fastify';
import {ZodTypeProvider} from 'fastify-type-provider-zod';

import {accessDeniedError, isAllowedPath, sanitizePath} from '../../util/fileUtil';
import {getAuthedContext} from './requestContext';

const feedMonitorRoutes = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

  typedFastify.get('/', async (request, reply: FastifyReply): Promise<void> => {
    const authedContext = getAuthedContext(request);
    const {services} = authedContext;
    try {
      const feedsAndRules = await services.feedService.getAll();
      reply.status(200).send(feedsAndRules);
    } catch ({code, message}) {
      reply.status(500).send({code, message});
    }
  });

  typedFastify.delete(
    '/:id',
    {
      schema: {
        params: feedIdParamSchema,
      },
    },
    async (request, reply: FastifyReply): Promise<void> => {
      const authedContext = getAuthedContext(request);
      const {services} = authedContext;
      try {
        const response = await services.feedService.removeItem(request.params.id);
        reply.status(200).send(response);
      } catch ({code, message}) {
        reply.status(500).send({code, message});
      }
    },
  );

  typedFastify.get(
    '/feeds/:id?',
    {
      schema: {
        params: feedIdOptionalParamSchema,
      },
    },
    async (request, reply: FastifyReply): Promise<void> => {
      const authedContext = getAuthedContext(request);
      const {services} = authedContext;
      try {
        const feeds = await services.feedService.getFeeds(request.params.id);
        reply.status(200).send(feeds);
      } catch ({code, message}) {
        reply.status(500).send({code, message});
      }
    },
  );

  typedFastify.put(
    '/feeds',
    {
      schema: {
        body: addFeedSchema,
      },
    },
    async (request, reply: FastifyReply): Promise<void> => {
      const authedContext = getAuthedContext(request);
      const {services} = authedContext;
      try {
        const feed = await services.feedService.addFeed(request.body);
        reply.status(200).send(feed);
      } catch ({code, message}) {
        reply.status(500).send({code, message});
      }
    },
  );

  typedFastify.patch(
    '/feeds/:id',
    {
      schema: {
        body: modifyFeedSchema,
        params: feedIdParamSchema,
      },
    },
    async (request, reply: FastifyReply): Promise<void> => {
      const authedContext = getAuthedContext(request);
      const {services} = authedContext;
      try {
        const response = await services.feedService.modifyFeed(request.params.id, request.body);
        reply.status(200).send(response);
      } catch ({code, message}) {
        reply.status(500).send({code, message});
      }
    },
  );

  typedFastify.get(
    '/feeds/:id/items',
    {
      schema: {
        params: feedIdParamSchema,
        querystring: feedItemsQuerySchema,
      },
    },
    async (request, reply: FastifyReply): Promise<void> => {
      const authedContext = getAuthedContext(request);
      const {services} = authedContext;
      try {
        const items = await services.feedService.getItems(request.params.id, request.query.search ?? '');
        reply.status(200).send(items);
      } catch ({code, message}) {
        reply.status(500).send({code, message});
      }
    },
  );

  typedFastify.get('/rules', async (request, reply: FastifyReply): Promise<void> => {
    const authedContext = getAuthedContext(request);
    const {services} = authedContext;
    try {
      const rules = await services.feedService.getRules();
      reply.status(200).send(rules);
    } catch ({code, message}) {
      reply.status(500).send({code, message});
    }
  });

  typedFastify.put(
    '/rules',
    {
      schema: {
        body: addRuleSchema,
      },
    },
    async (request, reply: FastifyReply): Promise<void> => {
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

      try {
        const rule = await services.feedService.addRule({
          ...request.body,
          destination: sanitizedPath,
        });
        reply.status(200).send(rule);
      } catch ({code, message}) {
        reply.status(500).send({code, message});
      }
    },
  );
};

export default feedMonitorRoutes;
