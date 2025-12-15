import type {FastifyReply, FastifyRequest} from 'fastify';

import {getAllServices} from '../services';

const failedInitializeResponse = (reply: FastifyReply) => {
  return reply.status(500).send({message: 'Flood server failed to initialze.'});
};

export default (request: FastifyRequest, reply: FastifyReply) => {
  if (request.user == null) {
    return failedInitializeResponse(reply);
  }

  request.services = getAllServices(request.user);
  if (request.services?.clientGatewayService == null) {
    return failedInitializeResponse(reply);
  }

  return undefined;
};
