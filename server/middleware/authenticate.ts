import {contentTokenSchema} from '@shared/schema/api/torrents';
import type {UserInDatabase} from '@shared/schema/Auth';
import {authTokenSchema} from '@shared/schema/Auth';
import type {FastifyReply, FastifyRequest} from 'fastify';
import jwt from 'jsonwebtoken';

import config from '../../config';
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

/** Verify a raw JWT string and return its decoded payload, or undefined on failure. */
const decodeToken = (token: string): unknown => {
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
 * Uses the strict AuthToken schema — ContentTokens with extra fields
 * (type, hash, indices) are naturally rejected by strictObject validation.
 */
export const authWithQueryToken = async (request: FastifyRequest): Promise<UserInDatabase | undefined> => {
  const queryToken = (request.query as Record<string, unknown>)?.token;
  if (typeof queryToken !== 'string' || queryToken.length === 0) {
    return undefined;
  }

  const payload = decodeToken(queryToken);
  if (payload == null) {
    return undefined;
  }

  // strict authTokenSchema rejects tokens with extra fields (e.g. content tokens).
  const parsed = authTokenSchema.safeParse(payload);
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
 * Authenticate via a content-retrieval token on the torrent data route.
 * Validates the token's type and scope (hash/indices must match the URL
 * path), resolves the user, and returns a full AuthedContext. Returns
 * undefined if the token is missing, invalid, or out of scope.
 */
export const authWithContentToken = async (
  request: FastifyRequest,
  expectedHash: string,
  expectedIndices: string,
): Promise<AuthedContext | undefined> => {
  const queryToken = (request.query as Record<string, unknown>)?.token;
  if (typeof queryToken !== 'string' || queryToken.length === 0) {
    return undefined;
  }

  const payload = decodeToken(queryToken);
  const parsed = contentTokenSchema.safeParse(payload);
  if (!parsed.success) {
    return undefined;
  }

  const {username, hash, indices, iat} = parsed.data;

  // Scope check: the token must name the exact hash and indices being requested.
  if (hash !== expectedHash || indices !== expectedIndices) {
    return undefined;
  }

  const user = await resolveUser(username, iat);
  if (user == null) {
    return undefined;
  }

  const services = getAllServices(user);
  if (services?.clientGatewayService == null) {
    return undefined;
  }

  return {user, services};
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
