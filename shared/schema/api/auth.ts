import type {infer as zodInfer} from 'zod';

import {AccessLevel} from '../constants/Auth';
import {credentialsSchema, basicAuthorizationSchema} from '../Auth';

import type {AuthMethod} from '../Auth';

const httpBasicAuth = require('basic-auth')

// All auth requests are schema validated to ensure security.

// POST /api/auth/authenticate
export const authAuthenticationSchema = credentialsSchema.pick({
  username: true,
  password: true,
});
export type AuthAuthenticationOptions = Required<zodInfer<typeof authAuthenticationSchema>>;

export const authHTTPBasicAuthenticationSchema = (req: any) => {
  console.error(4, JSON.stringify(req.header('authorization'), null, 2))
  const parsed = httpBasicAuth.parse(req.header('authorization'));
  console.error(3, JSON.stringify(parsed, null, 2))
  if (parsed === undefined) {
    return authAuthenticationSchema.safeParse({})
  }

  return authAuthenticationSchema.safeParse({username: parsed.name, password: parsed.pass})
}

// POST /api/auth/httpbasicauth
export const authHTTPBasicAuthSchema = basicAuthorizationSchema.pick({authorization: true});
export const authHTTPBasicCredentialsSchema = (req: any) => {
  return authHTTPBasicAuthSchema.safeParse({authorization: req.header('Authorization')})
}

export interface AuthHTTPBasicResponse {
  authorization: string;
  username: string | null;
  password: string | null;
}

// POST /api/auth/authenticate - success response
export interface AuthAuthenticationResponse {
  success: boolean;
  username: string;
  level: AccessLevel;
}

// POST /api/auth/register
export const authRegistrationSchema = credentialsSchema;
export type AuthRegistrationOptions = Required<zodInfer<typeof authRegistrationSchema>>;

// PATCH /api/auth/users/{username}
export const authUpdateUserSchema = credentialsSchema.partial();
export type AuthUpdateUserOptions = zodInfer<typeof authUpdateUserSchema>;

// GET /api/auth/verify - preload configurations
export interface AuthVerificationPreloadConfigs {
  authMethod: AuthMethod;
  pollInterval: number;
}

// GET /api/auth/verify - success response
export type AuthVerificationResponse = (
  | {
      initialUser: true;
    }
  | {
      initialUser: false;
      username: string;
      level: AccessLevel;
    }
) & {
  configs: AuthVerificationPreloadConfigs;
};
