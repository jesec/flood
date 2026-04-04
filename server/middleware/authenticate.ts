import {authTokenSchema} from '@shared/schema/Auth';
import type {FastifyReply, FastifyRequest} from 'fastify';
import jwt from 'jsonwebtoken';
import {number, object, string} from 'zod';

import config from '../../config';
import {UnauthorizedError} from '../errors';
import Users from '../models/Users';

type AuthenticateOptions = {
  attachOnly?: boolean;
};

// Lenient schema for extracting authentication fields from tokens that may
// include additional fields (e.g., content download tokens with hash/indices).
const tokenAuthFieldsSchema = object({
  username: string(),
  iat: number(),
});

const authenticate = async (request: FastifyRequest, options?: AuthenticateOptions) => {
  const {attachOnly = false} = options ?? {};

  if (request.user != null) {
    return true;
  }

  // Try JWT cookie first, then fall back to query string token
  let token = request.cookies?.jwt;
  if (typeof token !== 'string' || token.length === 0) {
    const queryToken = (request.query as Record<string, unknown>)?.token;
    if (typeof queryToken === 'string' && queryToken.length > 0) {
      token = queryToken;
    }
  }

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

  // Try strict auth token schema first, fall back to lenient schema for tokens
  // with additional fields (e.g., content download tokens with hash/indices)
  const strictResult = authTokenSchema.safeParse(payload);
  const parsedResult = strictResult.success ? strictResult : tokenAuthFieldsSchema.safeParse(payload);

  if (!parsedResult.success) {
    if (attachOnly) {
      return false;
    }

    throw new UnauthorizedError();
  }

  const {username, iat} = parsedResult.data;
  const user = await Users.lookupUser(username);

  if (user == null || user.timestamp > iat + 10) {
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
