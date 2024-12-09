import type {Response} from 'express';
import express from 'express';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

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
import requireAdmin from '../../middleware/requireAdmin';
import Users from '../../models/Users';
import {bootstrapServicesForUser, destroyUserServices} from '../../services';
import {getAuthToken, getCookieOptions} from '../../util/authUtil';

const router = express.Router();

const failedLoginResponse = 'Failed login.';

// Limit each IP to 200 request every 5 minutes
// to prevent brute forcing password or denial-of-service
router.use(
  '/',
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 200,
  }),
);

const sendAuthenticationResponse = (
  res: Response,
  credentials: Required<Pick<Credentials, 'username' | 'level'>>,
): Response => {
  const {username, level} = credentials;

  res.cookie('jwt', getAuthToken(username), getCookieOptions());

  const response: AuthAuthenticationResponse = {
    success: true,
    username,
    level,
  };

  return res.json(response);
};

const preloadConfigs: AuthVerificationPreloadConfigs = {
  authMethod: config.authMethod,
  pollInterval: config.torrentClientPollInterval,
};

router.use('/users', passport.authenticate('jwt', {session: false}), requireAdmin);

/**
 * POST /api/auth/authenticate
 * @summary Authenticates a user
 * @tags Auth
 * @security None
 * @param {AuthAuthenticationOptions} request.body.required - options - application/json
 * @return {object} 422 - request validation error - application/json
 * @return {object} 401 - incorrect username or password - application/json
 * @return {AuthAuthenticationResponse} 200 - success response - application/json
 */
router.post<unknown, unknown, AuthAuthenticationOptions>('/authenticate', async (req, res): Promise<Response> => {
  if (config.authMethod === 'none') {
    return sendAuthenticationResponse(res, Users.getConfigUser());
  }

  const parsedResult = authAuthenticationSchema.safeParse(req.body);

  if (!parsedResult.success) {
    return res.status(422).json({message: 'Validation error.'});
  }

  const credentials = parsedResult.data;

  return Users.comparePassword(credentials).then(
    (level) =>
      sendAuthenticationResponse(res, {
        ...credentials,
        level,
      }),
    () =>
      res.status(401).json({
        message: failedLoginResponse,
      }),
  );
});

// Allow unauthenticated registration if no users are currently registered.
router.use('/register', (req, res, next) => {
  Users.initialUserGate({
    handleInitialUser: () => {
      next();
    },
    handleSubsequentUser: () => {
      passport.authenticate('jwt', {session: false}, (err: unknown, user: UserInDatabase) => {
        if (err || !user) {
          return res.status(401).send('Unauthorized');
        }
        req.user = user;
        // Only admin users can create users
        requireAdmin(req, res, next);
      })(req, res, next);
    },
  });
});

/**
 * POST /api/auth/register
 * @summary Registers a user
 * @tags Auth
 * @security None - initial request
 * @security Administrator - subsequent requests
 * @param {AuthRegistrationOptions} request.body.required - options - application/json
 * @param {'true' | 'false'} cookie.query - whether to Set-Cookie if succeeded
 * @return {string} 404 - registration is disabled
 * @return {string} 403 - user is not authorized to create user
 * @return {object} 422 - request validation error - application/json
 * @return {{username: string}} 200 - success response if cookie=false - application/json
 * @return {AuthAuthenticationResponse} 200 - success response - application/json
 */
router.post<unknown, unknown, AuthRegistrationOptions, {cookie: string}>(
  '/register',
  async (req, res): Promise<Response> => {
    // No user can be registered when authMethod is none
    if (config.authMethod === 'none') {
      // Return 404
      return res.status(404).send('Not found');
    }

    const parsedResult = authRegistrationSchema.safeParse(req.body);

    if (!parsedResult.success) {
      return res.status(422).json({message: 'Validation error.'});
    }

    const credentials = parsedResult.data;

    // Attempt to save the user
    return Users.createUser(credentials).then(
      (user) => {
        bootstrapServicesForUser(user);

        if (req.query.cookie === 'false') {
          return res.status(200).json({username: user.username});
        }

        return sendAuthenticationResponse(res, credentials);
      },
      ({message}) => res.status(500).json({message}),
    );
  },
);

// Allow unauthenticated verification if no users are currently registered.
router.use('/verify', (req, res, next) => {
  // Unconditionally provide a token if auth is disabled
  if (config.authMethod === 'none') {
    const {username, level} = Users.getConfigUser();

    res.cookie('jwt', getAuthToken(username), getCookieOptions());

    const response: AuthVerificationResponse = {
      initialUser: false,
      username,
      level,
      configs: preloadConfigs,
    };

    res.json(response);
    return;
  }

  Users.initialUserGate({
    handleInitialUser: () => {
      const response: AuthVerificationResponse = {
        initialUser: true,
        configs: preloadConfigs,
      };
      res.json(response);
    },
    handleSubsequentUser: () => {
      passport.authenticate('jwt', {session: false}, (err: unknown, user: UserInDatabase) => {
        if (err || !user) {
          res.status(401).json({
            configs: preloadConfigs,
          });
          return;
        }

        req.user = user;
        next();
      })(req, res, next);
    },
  });
});

/**
 * GET /api/auth/verify
 * @summary Verifies the connectivity and validity of session
 * @tags Auth
 * @security User
 * @return {string} 401 - not authenticated or token expired
 * @return {string} 500 - authenticated succeeded but user is unattached (this should NOT happen)
 * @return {AuthVerificationResponse} 200 - success response - application/json
 */
router.get('/verify', (req, res): Response => {
  if (req.user == null) {
    return res.status(500).send('Unattached user.');
  }

  const response: AuthVerificationResponse = {
    initialUser: false,
    username: req.user.username,
    level: req.user.level,
    configs: preloadConfigs,
  };

  return res.json(response);
});

// All subsequent routes are protected.
router.use('/', passport.authenticate('jwt', {session: false}));

/**
 * GET /api/auth/logout
 * @summary Clears the session cookie
 * @tags Auth
 * @security User
 * @return {string} 401 - not authenticated or token expired
 * @return {} 200 - success response
 */
router.get('/logout', (_req, res) => {
  res.clearCookie('jwt').send();
});

// All subsequent routes need administrator access.
router.use('/', requireAdmin);

router.use('/users', (_req, res, next) => {
  // No operation on user when authMethod is none
  if (config.authMethod === 'none') {
    // Return 404
    res.status(404).send('Not found');
  }

  next();
});

/**
 * GET /api/auth/users
 * @summary Lists all users
 * @tags Auth
 * @security Administrator
 * @return {string} 401 - not authenticated or token expired
 * @return {string} 403 - user is not authorized to list users
 * @return {Array<Pick<UserInDatabase, 'username' | 'level'>>} 200 - success response - application/json
 */
router.get('/users', async (_req, res): Promise<Response> => {
  return Users.listUsers().then(
    (users) =>
      res.json(
        users.map((user) => ({
          username: user.username,
          level: user.level,
        })),
      ),
    ({code, message}) => res.status(500).json({code, message}),
  );
});

/**
 * DELETE /api/auth/users/{username}
 * @summary Deletes a user
 * @tags Auth
 * @security Administrator
 * @param {string} username.path - username of the user to be deleted
 * @return {string} 401 - not authenticated or token expired
 * @return {string} 403 - user is not authorized to delete user
 * @return {{username: string}} 200 - success response - application/json
 */
router.delete('/users/:username', async (req, res): Promise<Response> => {
  return Users.removeUser(req.params.username)
    .then(() => res.json({username: req.params.username}))
    .catch(({code, message}) => res.status(500).json({code, message}));
});

/**
 * PATCH /api/auth/users/{username}
 * @summary Updates a user
 * @tags Auth
 * @security Administrator
 * @param {string} username.path - username of the user to be updated
 * @param {AuthUpdateUserOptions} request.body.required - options - application/json
 * @return {string} 401 - not authenticated or token expired
 * @return {string} 403 - user is not authorized to update user
 * @return {object} 422 - request validation error - application/json
 * @return {} 200 - success response
 */
router.patch<{username: Credentials['username']}, unknown, AuthUpdateUserOptions>(
  '/users/:username',
  async (req, res): Promise<Response> => {
    const {username} = req.params;

    const parsedResult = authUpdateUserSchema.safeParse(req.body);

    if (!parsedResult.success) {
      return res.status(422).json({message: 'Validation error.'});
    }

    const patch = parsedResult.data;

    return Users.updateUser(username, patch)
      .then((newUsername) => {
        return Users.lookupUser(newUsername).then(async (user) => {
          await destroyUserServices(user._id);
          bootstrapServicesForUser(user);
          return res.status(200).json({});
        });
      })
      .catch(({code, message}) => res.status(500).json({code, message}));
  },
);

export default router;
