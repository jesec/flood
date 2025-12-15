import {authTokenSchema} from '@shared/schema/Auth';
import type {FastifyReply, FastifyRequest} from 'fastify';
import jwt from 'jsonwebtoken';

import config from '../../config';
import Users from '../models/Users';
import {parseCookies} from '../util/authUtil';

const unauthorized = (reply: FastifyReply) => {
  reply.status(401).send('Unauthorized');
};

export const authenticateRequest = async (request: FastifyRequest, reply: FastifyReply) => {
  if (request.user != null) {
    return;
  }

  const cookies = parseCookies(request);
  const token = cookies.jwt;

  if (typeof token !== 'string' || token.length === 0) {
    unauthorized(reply);
    return;
  }

  let payload: unknown;
  try {
    payload = jwt.verify(token, config.secret);
  } catch {
    unauthorized(reply);
    return;
  }

  const parsedResult = authTokenSchema.safeParse(payload);

  if (!parsedResult.success) {
    unauthorized(reply);
    return;
  }

  const user = await Users.lookupUser(parsedResult.data.username);

  if (user == null || user.timestamp > parsedResult.data.iat + 10) {
    unauthorized(reply);
    return;
  }

  request.user = user;
};
