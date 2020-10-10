import * as z from 'zod';

import {clientConnectionSettingsSchema} from './ClientConnectionSettings';

export enum AccessLevel {
  USER = 5,
  ADMINISTRATOR = 10,
}

export const credentialsSchema = z.object({
  username: z.string(),
  password: z.string(),
  client: clientConnectionSettingsSchema,
  level: z.nativeEnum(AccessLevel),
});

export type Credentials = z.infer<typeof credentialsSchema>;

export type UserInDatabase = Required<Credentials> & {_id: string};
