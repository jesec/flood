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
import type {Credentials, UserInDatabase} from '../../../shared/schema/Auth';
import Users from '../../models/Users';
import {bootstrapServicesForUser, destroyUserServices} from '../../services';
import {getAuthToken, getCookieOptions} from '../../util/authUtil';
import {rateLimit} from '../utils';

const failedLoginResponse = 'Failed login.';

const sendAuthenticationResponse = (
  reply: FastifyReply,
  credentials: Required<Pick<Credentials, 'username' | 'level'>>,
): FastifyReply => {
  const {username, level} = credentials;

  reply.setCookie('jwt', getAuthToken(username), getCookieOptions());

  const response: AuthAuthenticationResponse = {
    success: true,
    username,
    level,
  };

  return reply.send(response);
};

const preloadConfigs: AuthVerificationPreloadConfigs = {
  authMethod: config.authMethod,
  pollInterval: config.torrentClientPollInterval,
};

const ensureAdmin = async (fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  await fastify.authenticate(request, reply);
  if (reply.sent) {
    return false;
  }

  await fastify.requireAdmin(request, reply);
  if (reply.sent) {
    return false;
  }

  return true;
};

const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post<{Body: AuthAuthenticationOptions}>(
    '/authenticate',
    {
      ...rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 200,
      }),
    },
    async (request, reply) => {
      if (config.authMethod === 'none') {
        sendAuthenticationResponse(reply, Users.getConfigUser());
        return;
      }

      const parsedResult = authAuthenticationSchema.safeParse(request.body);

      if (!parsedResult.success) {
        reply.status(422).send({message: 'Validation error.'});
        return;
      }

      const credentials = parsedResult.data;

      return Users.comparePassword(credentials).then(
        (level) =>
          sendAuthenticationResponse(reply, {
            ...credentials,
            level,
          }),
        () =>
          reply.status(401).send({
            message: failedLoginResponse,
          }),
      );
    },
  );

  fastify.post<{Body: AuthRegistrationOptions; Querystring: {cookie?: string}}>('/register', async (request, reply) => {
    if (config.authMethod === 'none') {
      reply.status(404).send('Not found');
      return;
    }

    const parsedResult = authRegistrationSchema.safeParse(request.body);

    if (!parsedResult.success) {
      reply.status(422).send({message: 'Validation error.'});
      return;
    }

    const credentials = parsedResult.data;

    await Users.initialUserGate({
      handleInitialUser: async () => {
        return Users.createUser(credentials).then(
          (user) => {
            bootstrapServicesForUser(user);

            if (request.query.cookie === 'false') {
              reply.status(200).send({username: user.username});
              return;
            }

            sendAuthenticationResponse(reply, credentials);
          },
          ({message}) => reply.status(500).send({message}),
        );
      },
      handleSubsequentUser: async () => {
        const isAdmin = await ensureAdmin(fastify, request, reply);
        if (!isAdmin) {
          return;
        }

        return Users.createUser(credentials).then(
          (user) => {
            bootstrapServicesForUser(user);

            if (request.query.cookie === 'false') {
              reply.status(200).send({username: user.username});
              return;
            }

            sendAuthenticationResponse(reply, credentials);
          },
          ({message}) => reply.status(500).send({message}),
        );
      },
    });
  });

  fastify.get('/verify', async (request, reply) => {
    if (config.authMethod === 'none') {
      const {username, level} = Users.getConfigUser();

      reply.setCookie('jwt', getAuthToken(username), getCookieOptions());

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
        await fastify.authenticate(request, reply);
        if (reply.sent) {
          return;
        }

        if (request.user == null) {
          reply.status(500).send('Unattached user.');
          return;
        }

        const response: AuthVerificationResponse = {
          initialUser: false,
          username: request.user.username,
          level: request.user.level,
          configs: preloadConfigs,
        };

        reply.send(response);
      },
    });
  });

  fastify.register(async (authenticatedRoutes) => {
    authenticatedRoutes.addHook('preHandler', fastify.authenticate);

    authenticatedRoutes.get('/logout', (_request, reply) => {
      reply.clearCookie('jwt').send();
    });

    authenticatedRoutes.register(
      async (adminRoutes) => {
        adminRoutes.addHook('preHandler', async (request, reply) => {
          if (config.authMethod === 'none') {
            reply.status(404).send('Not found');
            return;
          }

          if (!(await ensureAdmin(fastify, request, reply))) {
            return;
          }
        });

        adminRoutes.get('/users', async (_request, reply) => {
          return Users.listUsers().then(
            (users) =>
              reply.send(
                users.map((user) => ({
                  username: user.username,
                  level: user.level,
                })),
              ),
            ({code, message}) => reply.status(500).send({code, message}),
          );
        });

        adminRoutes.delete<{Params: {username: Credentials['username']}}>(
          '/users/:username',
          async (request, reply) => {
            return Users.removeUser(request.params.username)
              .then(() => reply.send({username: request.params.username}))
              .catch(({code, message}) => reply.status(500).send({code, message}));
          },
        );

        adminRoutes.patch<{Params: {username: Credentials['username']}; Body: AuthUpdateUserOptions}>(
          '/users/:username',
          async (request, reply) => {
            const {username} = request.params;

            const parsedResult = authUpdateUserSchema.safeParse(request.body);

            if (!parsedResult.success) {
              reply.status(422).send({message: 'Validation error.'});
              return;
            }

            const patch = parsedResult.data;

            return Users.updateUser(username, patch)
              .then((newUsername) => {
                return Users.lookupUser(newUsername).then(async (user) => {
                  await destroyUserServices(user._id);
                  bootstrapServicesForUser(user);
                  return reply.status(200).send({});
                });
              })
              .catch(({code, message}) => reply.status(500).send({code, message}));
          },
        );
      },
      {prefix: '/users'},
    );
  });
};

export default authRoutes;
