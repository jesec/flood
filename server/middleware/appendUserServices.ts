import type {FastifyReply, FastifyRequest} from 'fastify';

import {InitializationFailedError} from '../errors';
import {getAllServices} from '../services';

export default async (req: FastifyRequest, _reply: FastifyReply): Promise<void> => {
  if (req.user == null) {
    throw new InitializationFailedError();
  }

  req.services = getAllServices(req.user);

  if (req.services?.clientGatewayService == null) {
    throw new InitializationFailedError();
  }
};
