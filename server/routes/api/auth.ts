import type {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {ZodTypeProvider} from 'fastify-type-provider-zod';
import {array, literal, nativeEnum, number, strictObject, string, union, void as voidSchema} from 'zod';

import config from '../../../config';
import type {
  AuthAuthenticationResponse,
  AuthRegistrationOptions,
  AuthVerificationResponse,
} from '../../../shared/schema/api/auth';
import {
  authAuthenticationSchema,
  authRegistrationSchema,
  authUpdateUserSchema,
  AuthVerificationPreloadConfigs,
} from '../../../shared/schema/api/auth';
import {authMethodSchema, type Credentials, credentialsSchema} from '../../../shared/schema/Auth';
import {AccessLevel} from '../../../shared/schema/constants/Auth';
import {NotFoundError} from '../../errors';
import {authenticateHook, authenticateRequest} from '../../middleware/authenticate';
import requireAdmin from '../../middleware/requireAdmin';
import Users from '../../models/Users';
import {bootstrapServicesForUser, destroyUserServices} from '../../services';
import {clearAuthCookie, getAuthToken, setAuthCookie} from '../../util/authUtil';
import {rateLimit} from '../utils';

const failedLoginResponse = 'Failed login.';

const sendAuthenticationResponse = (
  reply: FastifyReply,
  credentials: Required<Pick<Credentials, 'username' | 'level'>>,
): void => {
  const {username, level} = credentials;

  setAuthCookie(reply, getAuthToken(username));

  const response: AuthAuthenticationResponse = {
    success: true,
    username,
    level,
  };

  reply.send(response);
};

const preloadConfigs: AuthVerificationPreloadConfigs = {
  authMethod: config.authMethod,
  pollInterval: config.torrentClientPollInterval,
};

const authenticationResponseSchema = strictObject({
  success: literal(true),
  username: string(),
  level: nativeEnum(AccessLevel),
});

const registrationSuccessSchema = union([authenticationResponseSchema, strictObject({username: string()})]);

const verificationConfigsSchema = strictObject({
  authMethod: authMethodSchema,
  pollInterval: number(),
});

const verificationResponseSchema = union([
  strictObject({
    initialUser: literal(true),
    configs: verificationConfigsSchema,
  }),
  strictObject({
    initialUser: literal(false),
    username: string(),
    level: nativeEnum(AccessLevel),
    configs: verificationConfigsSchema,
  }),
]);

const verificationUnauthorizedSchema = strictObject({configs: verificationConfigsSchema});

const validationErrorSchema = strictObject({message: string()});

const userSummarySchema = credentialsSchema.pick({
  username: true,
  level: true,
});

const usernameParamSchema = credentialsSchema.pick({username: true});

const registrationQuerySchema = strictObject({cookie: string().optional()});

const authRoutes = async (fastify: FastifyInstance) => {
  const authRateLimitOptions = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 200,
  });

  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

  typedFastify.post(
    '/authenticate',
    {
      schema: {
        body: authAuthenticationSchema,
        response: {
          200: authenticationResponseSchema,
          401: validationErrorSchema,
        },
      },
      ...(authRateLimitOptions ?? {}),
    },
    async ({body: credentials}, reply): Promise<void> => {
      if (config.authMethod === 'none') {
        sendAuthenticationResponse(reply, Users.getConfigUser());
        return;
      }

      try {
        const level = await Users.comparePassword(credentials);

        sendAuthenticationResponse(reply, {username: credentials.username, level});
      } catch {
        reply.status(401).send({
          message: failedLoginResponse,
        });
      }
    },
  );

  const ensureRegistrationPermission = async (req: FastifyRequest, reply: FastifyReply) => {
    await Users.initialUserGate({
      handleInitialUser: () => undefined,
      handleSubsequentUser: async () => {
        await authenticateRequest(req);
        if (reply.sent) {
          return;
        }

        await requireAdmin(req, reply);
      },
    });
  };

  typedFastify.post<{
    Body: AuthRegistrationOptions;
    Querystring: {cookie?: string};
  }>(
    '/register',
    {
      ...(authRateLimitOptions ?? {}),
      preHandler: ensureRegistrationPermission,
      schema: {
        body: authRegistrationSchema,
        querystring: registrationQuerySchema,
        response: {
          200: registrationSuccessSchema,
          404: literal('Not found'),
          400: validationErrorSchema,
        },
      },
    },
    async (req, reply): Promise<void> => {
      if (config.authMethod === 'none') {
        reply.status(404).send('Not found');
        return;
      }

      const credentials = req.body;

      const user = await Users.createUser(credentials);
      bootstrapServicesForUser(user);

      if (req.query.cookie === 'false') {
        reply.status(200).send({username: user.username});
        return;
      }

      sendAuthenticationResponse(reply, credentials);
    },
  );

  fastify.get(
    '/verify',
    {
      ...(authRateLimitOptions ?? {}),
      schema: {
        response: {
          200: verificationResponseSchema,
          401: verificationUnauthorizedSchema,
        },
      },
    },
    async (req, reply): Promise<void> => {
      if (config.authMethod === 'none') {
        const {username, level} = Users.getConfigUser();

        setAuthCookie(reply, getAuthToken(username));

        const response: AuthVerificationResponse = {
          initialUser: false,
          username,
          level,
          configs: preloadConfigs,
        };

        reply.send(response);
        return;
      }

      await Users.initialUserGate({
        handleInitialUser: () => {
          const response: AuthVerificationResponse = {
            initialUser: true,
            configs: preloadConfigs,
          };
          reply.send(response);
        },
        handleSubsequentUser: async () => {
          const isAuthenticated = await authenticateRequest(req, {attachOnly: true});

          if (!isAuthenticated || req.user == null) {
            reply.status(401).send({
              configs: preloadConfigs,
            });
            return;
          }

          const response: AuthVerificationResponse = {
            initialUser: false,
            username: req.user.username,
            level: req.user.level,
            configs: preloadConfigs,
          };

          reply.send(response);
        },
      });
    },
  );

  await typedFastify.register(async (authenticatedRoutes) => {
    const typedAuthenticatedRoutes = authenticatedRoutes.withTypeProvider<ZodTypeProvider>();

    typedAuthenticatedRoutes.addHook('preHandler', authenticateHook);

    typedAuthenticatedRoutes.get(
      '/logout',
      {
        ...(authRateLimitOptions ?? {}),
        schema: {
          response: {
            200: voidSchema(),
          },
        },
      },
      (_req, reply) => {
        clearAuthCookie(reply);
        reply.send();
      },
    );

    await typedAuthenticatedRoutes.register(async (adminRoutes) => {
      const typedAdminRoutes = adminRoutes.withTypeProvider<ZodTypeProvider>();

      typedAdminRoutes.addHook('preHandler', requireAdmin);
      typedAdminRoutes.addHook('preHandler', async (_req, _reply) => {
        if (config.authMethod === 'none') {
          throw new NotFoundError();
        }
      });

      typedAdminRoutes.get(
        '/users',
        {
          ...(authRateLimitOptions ?? {}),
          schema: {
            response: {
              200: array(userSummarySchema),
            },
          },
        },
        async (_req, reply): Promise<void> => {
          const users = await Users.listUsers();
          reply.send(
            users.map((user) => ({
              username: user.username,
              level: user.level,
            })),
          );
        },
      );

      typedAdminRoutes.delete<{
        Params: {username: Credentials['username']};
      }>(
        '/users/:username',
        {
          ...(authRateLimitOptions ?? {}),
          schema: {
            params: usernameParamSchema,
            response: {
              200: usernameParamSchema,
            },
          },
        },
        async (req, reply): Promise<void> => {
          await Users.removeUser(req.params.username);
          reply.send({username: req.params.username});
        },
      );

      typedAdminRoutes.patch(
        '/users/:username',
        {
          schema: {
            body: authUpdateUserSchema,
            params: usernameParamSchema,
            response: {
              200: strictObject({}),
              400: validationErrorSchema,
            },
          },
        },
        async (req, reply): Promise<void> => {
          const {username} = req.params;
          const patch = req.body;

          const newUsername = await Users.updateUser(username, patch);

          const user = await Users.lookupUser(newUsername);

          await destroyUserServices(user._id);

          bootstrapServicesForUser(user);

          reply.status(200).send({});
        },
      );
    });
  });
};

export default authRoutes;
