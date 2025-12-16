import 'fastify';

import type {UserInDatabase} from '@shared/schema/Auth';
import type {ServiceInstances} from '../services';

declare module 'fastify' {
  interface FastifyRequest {
    cookies?: Record<string, string>;
    services?: ServiceInstances;
    user?: UserInDatabase;
  }
}
