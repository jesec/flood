import type {FastifyReply, FastifyRequest} from 'fastify';

import {AccessLevel} from '../../shared/schema/constants/Auth';
import {AdminRequiredError} from '../errors';

export default async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
  if (req.user == null || req.user.level !== AccessLevel.ADMINISTRATOR) {
    throw new AdminRequiredError();
  }
};
