import type {infer as zodInfer} from 'zod';
import {literal, nativeEnum, number, strictObject, string, union} from 'zod';

import {clientConnectionSettingsSchema} from './ClientConnectionSettings';
import {AccessLevel} from './constants/Auth';

export const authMethodSchema = union([literal('default'), literal('none')]);

export type AuthMethod = zodInfer<typeof authMethodSchema>;

export const credentialsSchema = strictObject({
  username: string(),
  password: string(),
  client: clientConnectionSettingsSchema,
  level: nativeEnum(AccessLevel),
});

export type Credentials = zodInfer<typeof credentialsSchema>;

export type UserInDatabase = Required<Credentials> & {_id: string; timestamp: number};

export const authTokenSchema = strictObject({
  username: string(),
  // issued at
  iat: number(),
  // expiration
  exp: number(),
});

export type AuthToken = zodInfer<typeof authTokenSchema>;
