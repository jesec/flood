import type {infer as zodInfer} from 'zod';
import z from 'zod';

import {clientConnectionSettingsSchema} from './ClientConnectionSettings';
import {AccessLevel} from './constants/Auth';

export const authMethodSchema = z.union([z.literal('default'), z.literal('none')]);

export type AuthMethod = zodInfer<typeof authMethodSchema>;

export const credentialsSchema = z
  .strictObject({
    username: z.string(),
    password: z.string(),
    client: clientConnectionSettingsSchema,
    level: z.enum(AccessLevel),
  })
  .strip();

export type Credentials = zodInfer<typeof credentialsSchema>;

export type UserInDatabase = Required<Credentials> & {_id: string; timestamp: number};

export const authTokenSchema = z.strictObject({
  username: z.string(),
  // issued at
  iat: z.number(),
  // expiration
  exp: z.number(),
});

export type AuthToken = zodInfer<typeof authTokenSchema>;
