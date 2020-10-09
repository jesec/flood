import express from 'express';
import joi from 'joi';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import type {Response} from 'express';
import type {Credentials} from '@shared/types/Auth';

import ajaxUtil from '../util/ajaxUtil';
import config from '../../config';
import requireAdmin from '../middleware/requireAdmin';
import services from '../services';
import Users from '../models/Users';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      initialUser?: boolean;
    }
  }
}

const router = express.Router();

const failedLoginResponse = 'Failed login.';

const setAuthToken = (res: Response, username: Credentials['username'], isAdmin: Credentials['isAdmin']): void => {
  const expirationSeconds = 60 * 60 * 24 * 7; // one week
  const cookieExpiration = Date.now() + expirationSeconds * 1000;

  // Create token if the password matched and no error was thrown.
  const token = jwt.sign({username}, config.secret, {
    expiresIn: expirationSeconds,
  });

  res.cookie('jwt', token, {expires: new Date(cookieExpiration), httpOnly: true, sameSite: 'strict'});

  res.json({
    success: true,
    token: `JWT ${token}`,
    username,
    isAdmin,
  });
};

const authValidation = joi.object().keys({
  username: joi.string(),
  password: joi.string(),
  host: joi.string().allow(null),
  port: joi.number().allow(null),
  socketPath: joi.string().allow(null),
  isAdmin: joi.bool(),
});

router.use('/', (req, res, next) => {
  const validation = authValidation.validate(req.body);

  if (!validation.error) {
    next();
  } else {
    res.status(422).json({
      message: 'Validation error.',
      error: validation.error,
    });
  }
});

router.use('/users', passport.authenticate('jwt', {session: false}), requireAdmin);

router.post('/authenticate', (req, res) => {
  if (config.disableUsersAndAuth) {
    setAuthToken(res, Users.getConfigUser()._id, true);
    return;
  }
  const credentials = {
    password: req.body.password,
    username: req.body.username,
  };

  Users.comparePassword(credentials, (isMatch, isAdmin, err) => {
    if (isMatch === true && err == null) {
      setAuthToken(res, credentials.username, isAdmin);
      return;
    }

    // Incorrect username or password.
    res.status(401).json({
      message: failedLoginResponse,
    });
  });
});

// Allow unauthenticated registration if no users are currently registered.
router.use('/register', (req, _res, next) => {
  Users.initialUserGate({
    handleInitialUser: () => {
      next();
    },
    handleSubsequentUser: () => {
      passport.authenticate('jwt', {session: false}, (passportReq, passportRes) => {
        passportRes.json({username: req.body.username});
      });
    },
  });
});

router.post('/register', (req, res) => {
  // No user can be registered when disableUsersAndAuth is true
  if (config.disableUsersAndAuth) {
    // Return 404
    res.status(404).send('Not found');
    return;
  }
  // Attempt to save the user
  Users.createUser(
    {
      username: req.body.username,
      password: req.body.password,
      host: req.body.host,
      port: req.body.port,
      socketPath: req.body.socketPath,
      isAdmin: true,
    },
    (createUserResponse, createUserError) => {
      if (createUserError) {
        ajaxUtil.getResponseFn(res)(createUserResponse, createUserError);
        return;
      }

      setAuthToken(res, req.body.username, true);
    },
  );
});

// Allow unauthenticated verification if no users are currently registered.
router.use('/verify', (req, res, next) => {
  if (config.disableUsersAndAuth) {
    setAuthToken(res, Users.getConfigUser()._id, true);
    return;
  }
  Users.initialUserGate({
    handleInitialUser: () => {
      req.initialUser = true;
      next();
    },
    handleSubsequentUser: () => {
      req.initialUser = false;
      passport.authenticate('jwt', {session: false})(req, res, next);
    },
  });
});

router.get('/verify', (req, res) => {
  res.json({
    initialUser: req.initialUser,
    username: req.user && req.user.username,
    isAdmin: req.user && req.user.isAdmin,
  });
});

// All subsequent routes are protected.
router.use('/', passport.authenticate('jwt', {session: false}));

router.get('/logout', (req, res) => {
  res.clearCookie('jwt').send();
});

router.use('/users', (req, res, next) => {
  // No operation on user when disableUsersAndAuth is true
  if (config.disableUsersAndAuth) {
    // Return 404
    res.status(404).send('Not found');
    return;
  }

  if (req.user && req.user.isAdmin) {
    next();
    return;
  }

  res.status(401).send('Not authorized');
});

router.get('/users', (req, res) => {
  Users.listUsers(ajaxUtil.getResponseFn(res));
});

router.delete('/users/:username', (req, res) => {
  const callback = ajaxUtil.getResponseFn(res);
  Users.removeUser(req.params.username, (id, err) => {
    if (err || id == null) {
      callback(null, err || new Error());
      return;
    }

    services.destroyUserServices(id);

    callback({usernmae: req.params.username});
  });
});

router.patch('/users/:username', (req, res) => {
  const {username} = req.params;
  const userPatch = req.body;

  if (!userPatch.socketPath) {
    userPatch.socketPath = null;
  } else {
    userPatch.host = null;
    userPatch.port = null;
  }

  Users.updateUser(username, userPatch, () => {
    Users.lookupUser({username}, (err, user) => {
      if (err) {
        res.status(500).json({error: err});
        return;
      }

      if (user != null) {
        services.destroyUserServices(user._id);
        services.bootstrapServicesForUser(user);
      }

      res.send();
    });
  });
});

router.put('/users', (req, res) => {
  Users.createUser(
    {
      username: req.body.username,
      password: req.body.password,
      host: req.body.host,
      port: req.body.port,
      socketPath: req.body.socketPath,
      isAdmin: req.body.isAdmin,
    },
    ajaxUtil.getResponseFn(res),
  );
});

export default router;
