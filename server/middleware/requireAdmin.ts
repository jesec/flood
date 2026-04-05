import type {FastifyReply, FastifyRequest} from 'fastify';

import {AccessLevel} from '../../shared/schema/constants/Auth';
import {AdminRequiredError} from '../errors';
import {getAuthContext} from './authenticate';

export default async (req: FastifyRequest, _reply: FastifyReply): Promise<void> => {
  const auth = getAuthContext(req);
  if (auth == null || auth.user.level !== AccessLevel.ADMINISTRATOR) {
    throw new AdminRequiredError();
  }
};
