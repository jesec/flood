import type {AuthToken} from '@shared/schema/Auth';
import {CookieOptions} from 'express';
import jwt from 'jsonwebtoken';

import config from '../../config';

const EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // one week

export const getCookieOptions = (): CookieOptions => ({
  expires: new Date(Date.now() + EXPIRATION_SECONDS * 1000),
  httpOnly: true,
  sameSite: 'strict',
});

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
