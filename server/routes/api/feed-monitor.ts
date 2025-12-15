import type {AddFeedOptions, AddRuleOptions, ModifyFeedOptions} from '@shared/types/api/feed-monitor';
import type {FastifyInstance, FastifyReply, FastifyRequest, RouteGenericInterface} from 'fastify';

import type {ServiceInstances} from '../../services';
import {accessDeniedError, isAllowedPath, sanitizePath} from '../../util/fileUtil';

type AuthedRequest<T extends RouteGenericInterface = RouteGenericInterface> = FastifyRequest<T> & {
  services: ServiceInstances;
};

const feedMonitorRoutes = async (fastify: FastifyInstance) => {
  fastify.get(
    '/',
    async (req, reply: FastifyReply): Promise<void> =>
      (req as AuthedRequest).services.feedService.getAll().then(
        (feedsAndRules) => reply.status(200).send(feedsAndRules),
        ({code, message}) => reply.status(500).send({code, message}),
      ),
  );

  fastify.delete<{
    Params: {id: string};
  }>(
    '/:id',
    async (req, reply: FastifyReply): Promise<void> =>
      (req as AuthedRequest<{Params: {id: string}}>).services.feedService
        .removeItem((req as AuthedRequest<{Params: {id: string}}>).params.id)
        .then(
          (response) => reply.status(200).send(response),
          ({code, message}) => reply.status(500).send({code, message}),
        ),
  );

  fastify.get<{
    Params: {id?: string};
  }>(
    '/feeds/:id?',
    async (req, reply: FastifyReply): Promise<void> =>
      (req as AuthedRequest<{Params: {id?: string}}>).services.feedService
        .getFeeds((req as AuthedRequest<{Params: {id?: string}}>).params.id)
        .then(
          (feeds) => reply.status(200).send(feeds),
          ({code, message}) => reply.status(500).send({code, message}),
        ),
  );

  fastify.put<{
    Body: AddFeedOptions;
  }>(
    '/feeds',
    async (req, reply: FastifyReply): Promise<void> =>
      (req as AuthedRequest<{Body: AddFeedOptions}>).services.feedService
        .addFeed((req as AuthedRequest<{Body: AddFeedOptions}>).body)
        .then(
          (feed) => reply.status(200).send(feed),
          ({code, message}) => reply.status(500).send({code, message}),
        ),
  );

  fastify.patch<{
    Body: ModifyFeedOptions;
    Params: {id: string};
  }>(
    '/feeds/:id',
    async (req, reply: FastifyReply): Promise<void> =>
      (req as AuthedRequest<{Body: ModifyFeedOptions; Params: {id: string}}>).services.feedService
        .modifyFeed(
          (req as AuthedRequest<{Body: ModifyFeedOptions; Params: {id: string}}>).params.id,
          (req as AuthedRequest<{Body: ModifyFeedOptions; Params: {id: string}}>).body,
        )
        .then(
          (response) => reply.status(200).send(response),
          ({code, message}) => reply.status(500).send({code, message}),
        ),
  );

  fastify.get<{
    Params: {id: string};
    Querystring: {search?: string};
  }>(
    '/feeds/:id/items',
    async (req, reply: FastifyReply): Promise<void> =>
      (req as AuthedRequest<{Params: {id: string}; Querystring: {search?: string}}>).services.feedService
        .getItems(
          (req as AuthedRequest<{Params: {id: string}; Querystring: {search?: string}}>).params.id,
          (req as AuthedRequest<{Params: {id: string}; Querystring: {search?: string}}>).query.search ?? '',
        )
        .then(
          (items) => reply.status(200).send(items),
          ({code, message}) => reply.status(500).send({code, message}),
        ),
  );

  fastify.get(
    '/rules',
    async (req, reply: FastifyReply): Promise<void> =>
      (req as AuthedRequest).services.feedService.getRules().then(
        (rules) => reply.status(200).send(rules),
        ({code, message}) => reply.status(500).send({code, message}),
      ),
  );

  fastify.put<{
    Body: AddRuleOptions;
  }>('/rules', async (req, reply: FastifyReply): Promise<void> => {
    let sanitizedPath: string | null = null;
    try {
      sanitizedPath = sanitizePath(req.body.destination);
      if (!isAllowedPath(sanitizedPath)) {
        const {code, message} = accessDeniedError();
        reply.status(403).send({code, message});
        return;
      }
    } catch ({code, message}) {
      reply.status(403).send({code, message});
      return;
    }

    return (req as AuthedRequest<{Body: AddRuleOptions}>).services.feedService
      .addRule({
        ...(req as AuthedRequest<{Body: AddRuleOptions}>).body,
        destination: sanitizedPath,
      })
      .then(
        (rule) => reply.status(200).send(rule),
        ({code, message}) => reply.status(500).send({code, message}),
      );
  });
};

export default feedMonitorRoutes;
