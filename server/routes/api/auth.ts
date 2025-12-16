import type {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';

import config from '../../../config';
import type {
  AuthAuthenticationOptions,
  AuthAuthenticationResponse,
  AuthRegistrationOptions,
  AuthUpdateUserOptions,
  AuthVerificationResponse,
} from '../../../shared/schema/api/auth';
import {
  authAuthenticationSchema,
  authRegistrationSchema,
  authUpdateUserSchema,
  AuthVerificationPreloadConfigs,
} from '../../../shared/schema/api/auth';
import type {Credentials} from '../../../shared/schema/Auth';
import {NotFoundError} from '../../errors';
import {authenticateHook, authenticateRequest} from '../../middleware/authenticate';
import requireAdmin from '../../middleware/requireAdmin';
import Users from '../../models/Users';
import {bootstrapServicesForUser, destroyUserServices} from '../../services';
import {clearAuthCookie, getAuthToken, setAuthCookie} from '../../util/authUtil';
import {rateLimit} from '../utils';
import {ZodTypeProvider} from 'fastify-type-provider-zod';

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

const authRoutes = async (fastify: FastifyInstance) => {
  const authRateLimitOptions = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 200,
  });

  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/authenticate',
    {
      schema: {
        body: authAuthenticationSchema,
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
        sendAuthenticationResponse(reply, {
          ...credentials,
          level,
        });
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

  fastify.post<{
    Body: AuthRegistrationOptions;
    Querystring: {cookie?: string};
  }>(
    '/register',
    {
      ...(authRateLimitOptions ?? {}),
      preHandler: ensureRegistrationPermission,
    },
    async (req, reply): Promise<void> => {
      if (config.authMethod === 'none') {
        reply.status(404).send('Not found');
        return;
      }

      const parsedResult = authRegistrationSchema.safeParse(req.body);

      if (!parsedResult.success) {
        reply.status(422).send({message: 'Validation error.'});
        return;
      }

      const credentials = parsedResult.data;

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

  await fastify.register(async (authenticatedRoutes) => {
    authenticatedRoutes.addHook('preHandler', authenticateHook);

    authenticatedRoutes.get(
      '/logout',
      {
        ...(authRateLimitOptions ?? {}),
      },
      (_req, reply) => {
        clearAuthCookie(reply);
        reply.send();
      },
    );

    await authenticatedRoutes.register(async (adminRoutes) => {
      adminRoutes.addHook('preHandler', requireAdmin);
      adminRoutes.addHook('preHandler', async (_req, _reply) => {
        if (config.authMethod === 'none') {
          throw new NotFoundError();
        }
      });

      adminRoutes.get(
        '/users',
        {
          ...(authRateLimitOptions ?? {}),
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

      adminRoutes.delete<{
        Params: {username: Credentials['username']};
      }>(
        '/users/:username',
        {
          ...(authRateLimitOptions ?? {}),
        },
        async (req, reply): Promise<void> => {
          await Users.removeUser(req.params.username);
          reply.send({username: req.params.username});
        },
      );

      adminRoutes.patch<{
        Body: AuthUpdateUserOptions;
        Params: {username: Credentials['username']};
      }>(
        '/users/:username',
        // {
        //   ...(authRateLimitOptions ?? {}),
        // },
        async (req, reply): Promise<void> => {
          const {username} = req.params;

          const parsedResult = authUpdateUserSchema.safeParse(req.body);

          if (!parsedResult.success) {
            reply.status(422).send({message: 'Validation error.'});
            return;
          }

          const patch = parsedResult.data;

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
