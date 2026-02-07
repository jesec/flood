import {clientSettingsSchema, setClientSettingsSchema} from '@shared/schema/ClientSettings';
import type {SetClientSettingsOptions} from '@shared/types/api/client';
import type {ClientSettings} from '@shared/types/ClientSettings';
import type {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {ZodTypeProvider} from 'fastify-type-provider-zod';
import {boolean, strictObject, z} from 'zod';

import requireAdmin from '../../middleware/requireAdmin';
import {getAuthedContext} from './requestContext';

const SAFE_CLIENT_SETTINGS: Array<keyof ClientSettings> = ['throttleGlobalDownSpeed', 'throttleGlobalUpSpeed'];

const clientRoutes = async (fastify: FastifyInstance) => {
  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

  typedFastify.get(
    '/connection-test',
    {
      schema: {
        summary: 'Test client connection',
        description: 'Check torrent client connectivity.',
        tags: ['Client'],
        security: [{User: []}],
        response: {
          200: strictObject({
            isConnected: boolean(),
          }),
        },
      },
    },
    async (req): Promise<{isConnected: boolean}> => {
      const authedContext = getAuthedContext(req);
      await authedContext.services.clientGatewayService.testGateway();
      return {isConnected: true};
    },
  );

  typedFastify.get(
    '/settings',
    {
      schema: {
        summary: 'Get client settings',
        description: 'Fetch current torrent client settings.',
        tags: ['Client'],
        security: [{User: []}],
        response: {
          200: clientSettingsSchema,
        },
      },
    },
    async (req): Promise<ClientSettings> => {
      const authedContext = getAuthedContext(req);
      return authedContext.services.clientGatewayService.getClientSettings();
    },
  );

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
        summary: 'Update client settings',
        description: 'Update torrent client settings.',
        tags: ['Client'],
        security: [{User: []}],
        body: setClientSettingsSchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (req: FastifyRequest<{Body: SetClientSettingsOptions}>) => {
      const authedContext = getAuthedContext(req);
      return authedContext.services.clientGatewayService.setClientSettings(req.body);
    },
  );
};

export default clientRoutes;
