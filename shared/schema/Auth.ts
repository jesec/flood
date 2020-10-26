import {nativeEnum, object, string} from 'zod';
import type {infer as zodInfer} from 'zod';

import {AccessLevel} from './constants/Auth';
import {clientConnectionSettingsSchema} from './ClientConnectionSettings';

export type AuthMethod = 'default' | 'none';

export const credentialsSchema = object({
  username: string(),
  password: string(),
  client: clientConnectionSettingsSchema,
  level: nativeEnum(AccessLevel),
});

export type Credentials = zodInfer<typeof credentialsSchema>;

export type UserInDatabase = Required<Credentials> & {_id: string};
