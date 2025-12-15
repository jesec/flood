import type {FastifyReply, FastifyRequest} from 'fastify';

import {AccessLevel} from '../../shared/schema/constants/Auth';

export default (req: FastifyRequest, reply: FastifyReply) => {
  if (req.user == null || req.user.level !== AccessLevel.ADMINISTRATOR) {
    reply.status(403).send({message: 'User is not admin.'});
  }
};
