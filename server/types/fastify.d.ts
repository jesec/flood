import type {AuthedContext} from '../middleware/authenticate';

declare module 'fastify' {
  interface FastifyRequest {
    auth?: AuthedContext;
  }
}
