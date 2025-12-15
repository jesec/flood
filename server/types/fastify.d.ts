import type {UserInDatabase} from '@shared/schema/Auth';
import type {FastifyReply, FastifyRequest} from 'fastify';

import type {ServiceInstances} from '../services';

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserInDatabase;
    services: ServiceInstances;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
