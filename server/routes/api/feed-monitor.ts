import type {AddFeedOptions, AddRuleOptions, ModifyFeedOptions} from '@shared/types/api/feed-monitor';
import type {FastifyInstance, FastifyReply} from 'fastify';

import {accessDeniedError, isAllowedPath, sanitizePath} from '../../util/fileUtil';
import {getAuthedContext} from './requestContext';

const feedMonitorRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', async (request, reply: FastifyReply): Promise<void> => {
    const authedContext = getAuthedContext(request);
    const {services} = authedContext;
    try {
      const feedsAndRules = await services.feedService.getAll();
      reply.status(200).send(feedsAndRules);
    } catch ({code, message}) {
      reply.status(500).send({code, message});
    }
  });

  fastify.delete<{
    Params: {id: string};
  }>('/:id', async (request, reply: FastifyReply): Promise<void> => {
    const authedContext = getAuthedContext(request);
    const {services} = authedContext;
    try {
      const response = await services.feedService.removeItem(request.params.id);
      reply.status(200).send(response);
    } catch ({code, message}) {
      reply.status(500).send({code, message});
    }
  });

  fastify.get<{
    Params: {id?: string};
  }>('/feeds/:id?', async (request, reply: FastifyReply): Promise<void> => {
    const authedContext = getAuthedContext(request);
    const {services} = authedContext;
    try {
      const feeds = await services.feedService.getFeeds(request.params.id);
      reply.status(200).send(feeds);
    } catch ({code, message}) {
      reply.status(500).send({code, message});
    }
  });

  fastify.put<{
    Body: AddFeedOptions;
  }>('/feeds', async (request, reply: FastifyReply): Promise<void> => {
    const authedContext = getAuthedContext(request);
    const {services} = authedContext;
    try {
      const feed = await services.feedService.addFeed(request.body);
      reply.status(200).send(feed);
    } catch ({code, message}) {
      reply.status(500).send({code, message});
    }
  });

  fastify.patch<{
    Body: ModifyFeedOptions;
    Params: {id: string};
  }>('/feeds/:id', async (request, reply: FastifyReply): Promise<void> => {
    const authedContext = getAuthedContext(request);
    const {services} = authedContext;
    try {
      const response = await services.feedService.modifyFeed(request.params.id, request.body);
      reply.status(200).send(response);
    } catch ({code, message}) {
      reply.status(500).send({code, message});
    }
  });

  fastify.get<{
    Params: {id: string};
    Querystring: {search?: string};
  }>('/feeds/:id/items', async (request, reply: FastifyReply): Promise<void> => {
    const authedContext = getAuthedContext(request);
    const {services} = authedContext;
    try {
      const items = await services.feedService.getItems(request.params.id, request.query.search ?? '');
      reply.status(200).send(items);
    } catch ({code, message}) {
      reply.status(500).send({code, message});
    }
  });

  fastify.get('/rules', async (request, reply: FastifyReply): Promise<void> => {
    const authedContext = getAuthedContext(request);
    const {services} = authedContext;
    try {
      const rules = await services.feedService.getRules();
      reply.status(200).send(rules);
    } catch ({code, message}) {
      reply.status(500).send({code, message});
    }
  });

  fastify.put<{
    Body: AddRuleOptions;
  }>('/rules', async (request, reply: FastifyReply): Promise<void> => {
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
  });
};

export default feedMonitorRoutes;
