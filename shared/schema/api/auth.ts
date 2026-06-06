import {type infer as zodInfer, z} from 'zod';

import type {AuthMethod} from '../Auth';
import {authMethodSchema, credentialsSchema} from '../Auth';
import {AccessLevel} from '../constants/Auth';

// All auth requests are schema validated to ensure security.

// POST /api/auth/authenticate
export const authAuthenticationRequiredSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type AuthAuthenticationOptions = zodInfer<typeof authAuthenticationRequiredSchema>;

export const authAuthenticationSchema = authAuthenticationRequiredSchema;

export const authAuthenticationRequestSchema = z
  .object({
    username: z.string().nullable().optional(),
    password: z.string().nullable().optional(),
  })
  .passthrough()
  .optional();
export type AuthAuthenticationRequestOptions = zodInfer<typeof authAuthenticationRequestSchema>;

// POST /api/auth/authenticate - success response
export interface AuthAuthenticationResponse {
  success: boolean;
  username: string;
  level: AccessLevel;
}

export const authAuthenticationResponseSchema = z
  .object({
    success: z.literal(true),
    username: z.string(),
    level: z.nativeEnum(AccessLevel),
  })
  .strict();

// POST /api/auth/register
export const authRegistrationSchema = credentialsSchema.strip();
export type AuthRegistrationOptions = Required<zodInfer<typeof authRegistrationSchema>>;

// POST /api/auth/register - success response
export interface AuthRegistrationResponse {
  username: string;
  level: AccessLevel;
}

export const authRegistrationResponseSchema = z
  .object({
    username: z.string(),
  })
  .strict();

// PATCH /api/auth/users/{username}
export const authUpdateUserSchema = credentialsSchema.partial().strip();
export type AuthUpdateUserOptions = zodInfer<typeof authUpdateUserSchema>;

// GET /api/auth/verify - preload configurations
export interface AuthVerificationPreloadConfigs {
  authMethod: AuthMethod;
  pollInterval: number;
}

export const authVerificationPreloadConfigsSchema = z
  .object({
    authMethod: authMethodSchema,
    pollInterval: z.number(),
  })
  .strict();

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

export const authVerificationResponseSchema = z.union([
  z
    .object({
      initialUser: z.literal(true),
      configs: authVerificationPreloadConfigsSchema,
    })
    .strict(),
  z
    .object({
      initialUser: z.literal(false),
      username: z.string(),
      level: z.nativeEnum(AccessLevel),
      configs: authVerificationPreloadConfigsSchema,
    })
    .strict(),
]);
