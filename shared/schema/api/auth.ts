import * as z from 'zod';

import {AccessLevel, credentialsSchema} from '../Auth';

// All auth requests are schema validated to ensure security.

// POST /api/auth/authenticate
export const authAuthenticationSchema = credentialsSchema.pick({username: true, password: true});
export type AuthAuthenticationOptions = Required<z.infer<typeof authAuthenticationSchema>>;

// POST /api/auth/authenticate - success response
export interface AuthAuthenticationResponse {
  success: boolean;
  username: string;
  level: AccessLevel;
}

// POST /api/auth/register
export const authRegistrationSchema = credentialsSchema;
export type AuthRegistrationOptions = Required<z.infer<typeof authRegistrationSchema>>;

// PATCH /api/auth/users/{username}
export const authUpdateUserSchema = credentialsSchema.partial();
export type AuthUpdateUserOptions = z.infer<typeof authUpdateUserSchema>;

// GET /api/auth/verify - preload configurations
export interface AuthVerificationPreloadConfigs {
  disableAuth: boolean;
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
