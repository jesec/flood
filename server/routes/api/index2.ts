import {FastifyInstance} from 'fastify';
import {FloodSettings} from '@shared/types/FloodSettings';

export async function setupApiRouters(app: FastifyInstance) {
  /**
   * GET /api/settings
   * @summary Gets all Flood's settings
   * @tags Flood
   * @security User
   */
  app.get('/api/settings', {}, async function (req): Promise<Partial<FloodSettings>> {
    return await req.services.settingService.get(null);
  });
}
