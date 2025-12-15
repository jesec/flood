import {authTokenSchema} from '@shared/schema/Auth';
import type {FastifyReply, FastifyRequest} from 'fastify';
import jwt from 'jsonwebtoken';

import config from '../../config';
import Users from '../models/Users';

type AuthenticateRequestOptions = {
  /**
   * When true, validate the token and attach the user but do not send an HTTP response on failure.
   * Callers can then decide how to respond (useful for endpoints that need to include extra data).
   */
  attachOnly?: boolean;
};

const unauthorized = (reply: FastifyReply) => {
  reply.status(401).send('Unauthorized');
};

export const authenticateRequest = async (
  request: FastifyRequest,
  reply: FastifyReply,
  options: AuthenticateRequestOptions = {},
) => {
  const {attachOnly = false} = options;

  if (request.user != null) {
    return true;
  }

  const token = request.cookies?.jwt;

  if (typeof token !== 'string' || token.length === 0) {
    if (!attachOnly) {
      unauthorized(reply);
    }
    return false;
  }

  let payload: unknown;
  try {
    payload = jwt.verify(token, config.secret);
  } catch {
    if (!attachOnly) {
      unauthorized(reply);
    }
    return false;
  }

  const parsedResult = authTokenSchema.safeParse(payload);

  if (!parsedResult.success) {
    if (!attachOnly) {
      unauthorized(reply);
    }
    return false;
  }

  const user = await Users.lookupUser(parsedResult.data.username);

  if (user == null || user.timestamp > parsedResult.data.iat + 10) {
    if (!attachOnly) {
      unauthorized(reply);
    }
    return false;
  }

  request.user = user;
  return true;
};
