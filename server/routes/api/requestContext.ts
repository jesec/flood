import type {FastifyRequest} from 'fastify';

import {UnauthorizedError} from '../../errors';

type AuthedContext = {
  services: NonNullable<FastifyRequest['services']>;
  user: NonNullable<FastifyRequest['user']>;
};

export const getAuthedContext = (request: FastifyRequest): AuthedContext => {
  if (request.services == null || request.user == null) {
    throw new UnauthorizedError();
  }

  return {
    services: request.services,
    user: request.user,
  };
};
