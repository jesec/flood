import {FastifyInstance} from 'fastify';
import {ClientSettings} from '@shared/types/ClientSettings';

export async function setupClientRoutes(app: FastifyInstance) {
  /**
   * GET /api/client/settings
   * @summary Gets settings of torrent client managed by Flood.
   * @tags Client
   * @security User
   */
  app.get('/api/client/settings', async (req): Promise<ClientSettings> => {
    return await req.services.clientGatewayService.getClientSettings();
  });
}
