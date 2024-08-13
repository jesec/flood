import type {infer as zodInfer} from 'zod';

import type {AuthMethod} from '../Auth';
import {credentialsSchema} from '../Auth';
import {AccessLevel} from '../constants/Auth';

// All auth requests are schema validated to ensure security.

// POST /api/auth/authenticate
export const authAuthenticationSchema = credentialsSchema.pick({
  username: true,
  password: true,
});
export type AuthAuthenticationOptions = Required<zodInfer<typeof authAuthenticationSchema>>;

// POST /api/auth/authenticate - success response
export interface AuthAuthenticationResponse {
  success: boolean;
  username: string;
  level: AccessLevel;
}

// POST /api/auth/register
export const authRegistrationSchema = credentialsSchema;
export type AuthRegistrationOptions = Required<zodInfer<typeof authRegistrationSchema>>;

// POST /api/auth/register - success response
export interface AuthRegistrationResponse {
  username: string;
  level: AccessLevel;
}

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
