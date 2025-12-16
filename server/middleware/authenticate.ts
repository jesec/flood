import {authTokenSchema} from '@shared/schema/Auth';
import type {FastifyReply, FastifyRequest} from 'fastify';
import jwt from 'jsonwebtoken';

import config from '../../config';
import {UnauthorizedError} from '../errors';
import Users from '../models/Users';

type AuthenticateOptions = {
  attachOnly?: boolean;
};

const authenticate = async (request: FastifyRequest, options?: AuthenticateOptions) => {
  const {attachOnly = false} = options ?? {};

  if (request.user != null) {
    return true;
  }

  const token = request.cookies?.jwt;

  if (typeof token !== 'string' || token.length === 0) {
    if (attachOnly) {
      return false;
    }

    throw new UnauthorizedError();
  }

  let payload: unknown;
  try {
    payload = jwt.verify(token, config.secret);
  } catch {
    if (attachOnly) {
      return false;
    }

    throw new UnauthorizedError();
  }

  const parsedResult = authTokenSchema.safeParse(payload);

  if (!parsedResult.success) {
    if (attachOnly) {
      return false;
    }

    throw new UnauthorizedError();
  }

  const user = await Users.lookupUser(parsedResult.data.username);

  if (user == null || user.timestamp > parsedResult.data.iat + 10) {
    if (attachOnly) {
      return false;
    }

    throw new UnauthorizedError();
  }

  request.user = user;
  return true;
};

export const authenticateHook = async (request: FastifyRequest, _reply: FastifyReply) => authenticate(request);

export const authenticateRequest = async (request: FastifyRequest, options?: AuthenticateOptions) =>
  authenticate(request, options);
