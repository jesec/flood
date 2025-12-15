import type {FastifyReply, FastifyRequest} from 'fastify';

import {getAllServices} from '../services';

const failedInitializeResponse = (reply: FastifyReply) => {
  reply.status(500).send({message: 'Flood server failed to initialze.'});
};

export default async (req: FastifyRequest, reply: FastifyReply) => {
  if (req.user == null) {
    return failedInitializeResponse(reply);
  }

  req.services = getAllServices(req.user);
  if (req.services?.clientGatewayService == null) {
    return failedInitializeResponse(reply);
  }
};
