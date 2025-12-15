import type {UserInDatabase} from '@shared/schema/Auth';
import type {SetClientSettingsOptions} from '@shared/types/api/client';
import type {ClientSettings} from '@shared/types/ClientSettings';
import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
  RouteGenericInterface,
} from 'fastify';

import requireAdmin from '../../middleware/requireAdmin';
import type {ServiceInstances} from '../../services';

const SAFE_CLIENT_SETTINGS: Array<keyof ClientSettings> = ['throttleGlobalDownSpeed', 'throttleGlobalUpSpeed'];

type AuthedRequest<T extends RouteGenericInterface = RouteGenericInterface> = FastifyRequest<T> & {
  services: ServiceInstances;
  user: UserInDatabase;
};

const clientRoutes = async (fastify: FastifyInstance) => {
  fastify.get(
    '/connection-test',
    async (req, reply: FastifyReply): Promise<void> =>
      (req as AuthedRequest).services.clientGatewayService.testGateway().then(
        () => reply.status(200).send({isConnected: true}),
        () => reply.status(500).send({isConnected: false}),
      ),
  );

  fastify.get(
    '/settings',
    async (req, reply: FastifyReply): Promise<void> =>
      (req as AuthedRequest).services.clientGatewayService.getClientSettings().then(
        (settings) => reply.status(200).send(settings),
        ({code, message}) => reply.status(500).send({code, message}),
      ),
  );

  const enforceAdminForSensitiveSettings = (
    req: FastifyRequest<{Body: SetClientSettingsOptions}>,
    reply: FastifyReply,
    done: HookHandlerDoneFunction,
  ) => {
    const authedReq = req as AuthedRequest<{Body: SetClientSettingsOptions}>;
    if (
      Object.keys(authedReq.body ?? {}).some((key) => {
        return !SAFE_CLIENT_SETTINGS.includes(key as keyof ClientSettings);
      })
    ) {
      requireAdmin(authedReq, reply, done);
    }
  };

  fastify.patch<{
    Body: SetClientSettingsOptions;
  }>(
    '/settings',
    {preHandler: enforceAdminForSensitiveSettings},
    async (req, reply: FastifyReply): Promise<void> =>
      (req as AuthedRequest<{Body: SetClientSettingsOptions}>).services.clientGatewayService
        .setClientSettings((req as AuthedRequest<{Body: SetClientSettingsOptions}>).body)
        .then(
          (response) => reply.status(200).send(response),
          ({code, message}) => reply.status(500).send({code, message}),
        ),
  );
};

export default clientRoutes;
