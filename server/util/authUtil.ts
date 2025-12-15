import type {AuthToken} from '@shared/schema/Auth';
import type {FastifyReply, FastifyRequest} from 'fastify';
import jwt from 'jsonwebtoken';

import config from '../../config';

const EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // one week

type FloodCookieOptions = {
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: 'lax' | 'strict' | 'none';
};

const serializeCookie = (name: string, value: string, options: FloodCookieOptions): string => {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.maxAge != null) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  parts.push(`Path=${options.path ?? '/'}`);

  if (options.httpOnly) {
    parts.push('HttpOnly');
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite.charAt(0).toUpperCase()}${options.sameSite.slice(1)}`);
  }

  return parts.join('; ');
};

export const getCookieOptions = (): FloodCookieOptions => ({
  expires: new Date(Date.now() + EXPIRATION_SECONDS * 1000),
  httpOnly: true,
  sameSite: 'strict',
});

const getAuthCookie = (token: string): string => serializeCookie('jwt', token, {...getCookieOptions(), path: '/'});

export const setAuthCookie = (reply: FastifyReply, token: string): void => {
  reply.header('Set-Cookie', getAuthCookie(token));
};

export const clearAuthCookie = (reply: FastifyReply): void => {
  reply.header(
    'Set-Cookie',
    serializeCookie('jwt', '', {
      path: '/',
      expires: new Date(0),
      maxAge: 0,
      httpOnly: true,
      sameSite: 'strict',
    }),
  );
};

export const parseCookies = (request: FastifyRequest): Record<string, string> => request.cookies ?? {};

export const getAuthToken = (username: string, iat?: number): string => {
  const authTokenPayload: Partial<AuthToken> = {
    username,
  };

  if (iat != null) {
    authTokenPayload.iat = iat;
  }

  return jwt.sign(authTokenPayload, config.secret, {
    expiresIn: EXPIRATION_SECONDS,
  });
};

export const getToken = <T extends Record<string, unknown>>(payload: Omit<T, 'iat' | 'exp'>) =>
  jwt.sign(payload, config.secret, {
    expiresIn: EXPIRATION_SECONDS,
  });

export const verifyToken = async (token: string): Promise<Record<string, unknown>> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err !== null || decoded == null) {
        reject(err);
        return;
      }

      resolve(decoded as Record<string, unknown>);
    });
  });
