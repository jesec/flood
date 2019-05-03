const express = require('express');
const joi = require('joi');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const ajaxUtil = require('../util/ajaxUtil');

const requireAdmin = require('../middleware/requireAdmin');
const config = require('../../config');

const router = express.Router();
const services = require('../services');
const Users = require('../models/Users');

const failedLoginResponse = 'Failed login.';

const setAuthToken = (res, username, isAdmin) => {
  const expirationSeconds = 60 * 60 * 24 * 7; // one week
  const cookieExpiration = Date.now() + expirationSeconds * 1000;

  // Create token if the password matched and no error was thrown.
  const token = jwt.sign({username}, config.secret, {
    expiresIn: expirationSeconds,
  });

  res.cookie('jwt', token, {expires: new Date(cookieExpiration), httpOnly: true});

  return res.json({
    success: true,
    token: `JWT ${token}`,
    username,
    isAdmin,
  });
};

const authValidation = joi.object().keys({
  username: joi.string(),
  password: joi.string(),
  host: joi.string(),
  port: joi.string(),
  socketPath: joi.string(),
  isAdmin: joi.bool(),
});

router.use('/', (req, res, next) => {
  const validation = joi.validate(req.body, authValidation);

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
  const credentials = {
    password: req.body.password,
    username: req.body.username,
  };

  Users.comparePassword(credentials, (isMatch, isAdmin, err) => {
    if (isMatch != null && !err) {
      return setAuthToken(res, credentials.username, isAdmin);
    }

    // Incorrect username or password.
    return res.status(401).json({
      message: failedLoginResponse,
    });
  });
});

// Allow unauthenticated registration if no users are currently registered.
router.use('/register', (req, res, next) => {
  Users.initialUserGate({
    handleInitialUser: () => {
      next();
    },
    handleSubsequentUser: () => {
      passport.authenticate('jwt', {session: false}, (passportReq, passportRes) => {
        passportRes.json({username: req.username});
      });
    },
  });
});

router.post('/register', (req, res) => {
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

router.get('/users', (req, res) => {
  Users.listUsers(ajaxUtil.getResponseFn(res));
});

router.delete('/users/:username', (req, res) => {
  Users.removeUser(req.params.username, ajaxUtil.getResponseFn(res));
  services.destroyUserServices(req.user);
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
      if (err) return req.status(500).json({error: err});
      services.updateUserServices(user);
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

module.exports = router;
