import type {FastifyInstance} from 'fastify';

import type {SetClientSettingsOptions} from '@shared/types/api/client';
import type {ClientSettings} from '@shared/types/ClientSettings';

const SAFE_CLIENT_SETTINGS: Array<keyof ClientSettings> = ['throttleGlobalDownSpeed', 'throttleGlobalUpSpeed'];

const clientRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/connection-test', async (request, reply) =>
    request.services.clientGatewayService.testGateway().then(
      () => reply.status(200).send({isConnected: true}),
      () => reply.status(500).send({isConnected: false}),
    ),
  );

  fastify.get('/settings', async (request, reply) =>
    request.services.clientGatewayService.getClientSettings().then(
      (settings) => reply.status(200).send(settings),
      ({code, message}) => reply.status(500).send({code, message}),
    ),
  );

  fastify.patch<{Body: SetClientSettingsOptions}>('/settings', async (request, reply) => {
    if (
      Object.keys(request.body).some((key) => {
        return !SAFE_CLIENT_SETTINGS.includes(key as keyof ClientSettings);
      })
    ) {
      await fastify.requireAdmin(request, reply);
      if (reply.sent) {
        return;
      }
    }

    return request.services.clientGatewayService.setClientSettings(request.body).then(
      (response) => reply.status(200).send(response),
      ({code, message}) => reply.status(500).send({code, message}),
    );
  });
};

export default clientRoutes;
