import type {FastifyInstance} from 'fastify';

import type {AddFeedOptions, AddRuleOptions, ModifyFeedOptions} from '@shared/types/api/feed-monitor';

import {accessDeniedError, isAllowedPath, sanitizePath} from '../../util/fileUtil';

const feedMonitorRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', async (request, reply) =>
    request.services.feedService.getAll().then(
      (feedsAndRules) => reply.status(200).send(feedsAndRules),
      ({code, message}) => reply.status(500).send({code, message}),
    ),
  );

  fastify.delete<{Params: {id: string}}>('/:id', async (request, reply) =>
    request.services.feedService.removeItem(request.params.id).then(
      (response) => reply.status(200).send(response),
      ({code, message}) => reply.status(500).send({code, message}),
    ),
  );

  fastify.get<{Params: {id?: string}}>('/feeds/:id?', async (request, reply) =>
    request.services.feedService.getFeeds(request.params.id).then(
      (feeds) => reply.status(200).send(feeds),
      ({code, message}) => reply.status(500).send({code, message}),
    ),
  );

  fastify.put<{Body: AddFeedOptions}>('/feeds', async (request, reply) =>
    request.services.feedService.addFeed(request.body).then(
      (feed) => reply.status(200).send(feed),
      ({code, message}) => reply.status(500).send({code, message}),
    ),
  );

  fastify.patch<{Params: {id: string}; Body: ModifyFeedOptions}>('/feeds/:id', async (request, reply) =>
    request.services.feedService.modifyFeed(request.params.id, request.body).then(
      (response) => reply.status(200).send(response),
      ({code, message}) => reply.status(500).send({code, message}),
    ),
  );

  fastify.get<{Params: {id: string}; Querystring: {search?: string}}>('/feeds/:id/items', async (request, reply) =>
    request.services.feedService.getItems(request.params.id, request.query.search).then(
      (items) => reply.status(200).send(items),
      ({code, message}) => reply.status(500).send({code, message}),
    ),
  );

  fastify.get('/rules', async (request, reply) =>
    request.services.feedService.getRules().then(
      (rules) => reply.status(200).send(rules),
      ({code, message}) => reply.status(500).send({code, message}),
    ),
  );

  fastify.put<{Body: AddRuleOptions}>('/rules', async (request, reply) => {
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

    return request.services.feedService.addRule({...request.body, destination: sanitizedPath}).then(
      (rule) => reply.status(200).send(rule),
      ({code, message}) => reply.status(500).send({code, message}),
    );
  });
};

export default feedMonitorRoutes;
