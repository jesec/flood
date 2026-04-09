import config from '@server/config';
import type {UserInDatabase} from '@shared/schema/Auth';
import {authTokenSchema} from '@shared/schema/Auth';
import type {FastifyReply, FastifyRequest} from 'fastify';
import jwt from 'jsonwebtoken';
import {number, object, string} from 'zod';

import {UnauthorizedError} from '../errors';
import Users from '../models/Users';
import {getAllServices, type ServiceInstances} from '../services';

export type AuthedContext = {
  user: UserInDatabase;
  services: ServiceInstances;
};

export const getAuthContext = (request: FastifyRequest): AuthedContext | undefined => {
  return request.auth;
};

export const setAuthContext = (request: FastifyRequest, context: AuthedContext): void => {
  request.auth = context;
};

export const getRequiredAuthContext = (request: FastifyRequest): AuthedContext => {
  const context = request.auth;
  if (context == null) {
    throw new UnauthorizedError();
  }
  return context;
};

// Lenient schema used for query-string tokens (e.g. ContentToken) which carry
// extra fields (hash, indices) beyond the base auth fields.
const queryTokenFieldsSchema = object({
  username: string(),
  iat: number(),
});

/** Verify a raw JWT string and return its decoded payload, or undefined on failure. */
const decodeToken = (token: string): unknown | undefined => {
  try {
    return jwt.verify(token, config.secret);
  } catch {
    return undefined;
  }
};

const resolveUser = async (username: string, iat: number): Promise<UserInDatabase | undefined> => {
  const user = await Users.lookupUser(username);
  if (user == null || user.timestamp > iat + 10) {
    return undefined;
  }
  return user;
};

/**
 * Authenticate from the httpOnly JWT cookie.
 * Cookie tokens are always plain AuthTokens: {username, iat, exp} — validated strictly.
 */
export const authWithCookies = async (request: FastifyRequest): Promise<UserInDatabase | undefined> => {
  const token = request.cookies?.jwt;
  if (typeof token !== 'string' || token.length === 0) {
    return undefined;
  }

  const payload = decodeToken(token);
  const parsed = authTokenSchema.safeParse(payload);
  if (!parsed.success) {
    return undefined;
  }

  return resolveUser(parsed.data.username, parsed.data.iat);
};

/**
 * Authenticate from the `?token=` query parameter.
 * Query tokens may be ContentTokens carrying extra fields (hash, indices),
 * so only the base auth fields (username, iat) are required.
 */
export const authWithQueryToken = async (request: FastifyRequest): Promise<UserInDatabase | undefined> => {
  const queryToken = (request.query as Record<string, unknown>)?.token;
  if (typeof queryToken !== 'string' || queryToken.length === 0) {
    return undefined;
  }

  const payload = decodeToken(queryToken);
  const parsed = queryTokenFieldsSchema.safeParse(payload);
  if (!parsed.success) {
    return undefined;
  }

  return resolveUser(parsed.data.username, parsed.data.iat);
};

/**
 * Try to resolve the current user from the request (cookie or query token).
 * Returns the user or undefined — never throws.
 */
export const resolveRequestUser = async (request: FastifyRequest): Promise<UserInDatabase | undefined> => {
  return (await authWithCookies(request)) ?? (await authWithQueryToken(request));
};

/**
 * Fastify preHandler hook: tries to authenticate the request and attach auth
 * context (user + services). Silently skips if authentication fails — handlers
 * that require auth should call `getRequiredAuthContext(request)`.
 */
export const authenticateHook = async (request: FastifyRequest, _reply: FastifyReply) => {
  if (getAuthContext(request) != null) {
    return;
  }

  const user = await resolveRequestUser(request);
  if (user == null) {
    return;
  }

  const services = getAllServices(user);
  if (services?.clientGatewayService == null) {
    return;
  }

  setAuthContext(request, {user, services});
};
