import * as z from 'zod';
import {AccessLevel, credentialsSchema} from '../Auth';

const httpBasicAuth = require('basic-auth')

// All auth requests are schema validated to ensure security.

// POST /api/auth/authenticate
export const authAuthenticationSchema = credentialsSchema.pick({username: true, password: true});
export const authHTTPBasicAuthenticationSchema = (req: any) => {
  const parsed = httpBasicAuth.parse(req.header('authorization'));
  if (parsed === undefined) {
    return authAuthenticationSchema.safeParse({})
  }

  return authAuthenticationSchema.safeParse({username: parsed.name, password: parsed.pass})
}

export type AuthAuthenticationOptions = Required<z.infer<typeof authAuthenticationSchema>>;

// POST /api/auth/authenticate - success response
export interface AuthAuthenticationResponse {
  success: boolean;
  token: string;
  username: string;
  level: AccessLevel;
}

// POST /api/auth/register
export const authRegistrationSchema = credentialsSchema;
export type AuthRegistrationOptions = Required<z.infer<typeof authRegistrationSchema>>;

// PATCH /api/auth/users/{username}
export const authUpdateUserSchema = credentialsSchema.partial();
export type AuthUpdateUserOptions = z.infer<typeof authUpdateUserSchema>;

// GET /api/auth/verify - success response
export type AuthVerificationResponse =
  | {
      initialUser: true;
    }
  | {
      initialUser: false;
      username: string;
      level: AccessLevel;
      token?: string;
    };
