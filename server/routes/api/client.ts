import {setClientSettingsSchema} from '@shared/schema/api/client';
import type {SetClientSettingsOptions} from '@shared/types/api/client';
import type {ClientSettings} from '@shared/types/ClientSettings';
import type {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {ZodTypeProvider} from 'fastify-type-provider-zod';
import {boolean, strictObject} from 'zod';

import requireAdmin from '../../middleware/requireAdmin';
import {getAuthedContext} from './requestContext';

const SAFE_CLIENT_SETTINGS: Array<keyof ClientSettings> = ['throttleGlobalDownSpeed', 'throttleGlobalUpSpeed'];

const clientRoutes = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

  typedFastify.get(
    '/connection-test',
    {
      schema: {
        response: {
          200: strictObject({
            isConnected: boolean(),
          }),
        },
      },
    },
    async (req, reply: FastifyReply): Promise<void> => {
      const authedContext = getAuthedContext(req);

      try {
        await authedContext.services.clientGatewayService.testGateway();
        reply.status(200).send({isConnected: true});
      } catch {
        reply.status(500).send({isConnected: false});
      }
    },
  );

  typedFastify.get('/settings', async (req, reply: FastifyReply): Promise<void> => {
    const authedContext = getAuthedContext(req);

    try {
      const settings = await authedContext.services.clientGatewayService.getClientSettings();
      reply.status(200).send(settings);
    } catch (error) {
      const {code, message} = error as {code?: string; message?: string};
      reply.status(500).send({code, message});
    }
  });

  const enforceAdminForSensitiveSettings = async (
    req: FastifyRequest<{Body: SetClientSettingsOptions}>,
    reply: FastifyReply,
  ) => {
    getAuthedContext(req);
    if (
      Object.keys(req.body ?? {}).some((key) => {
        return !SAFE_CLIENT_SETTINGS.includes(key as keyof ClientSettings);
      })
    ) {
      await requireAdmin(req, reply);
    }
  };

  typedFastify.patch(
    '/settings',
    {
      preHandler: enforceAdminForSensitiveSettings,
      schema: {
        body: setClientSettingsSchema,
      },
    },
    async (req: FastifyRequest<{Body: SetClientSettingsOptions}>, reply: FastifyReply): Promise<void> => {
      const authedContext = getAuthedContext(req);

      try {
        const response = await authedContext.services.clientGatewayService.setClientSettings(req.body);
        reply.status(200).send(response);
      } catch (error) {
        const {code, message} = error as {code?: string; message?: string};
        reply.status(500).send({code, message});
      }
    },
  );
};

export default clientRoutes;
