'use strict';
const ajaxUtil = require('../util/ajaxUtil');
const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const config = require('../../config');
const router = express.Router();
const Users = require('../models/Users');

const failedLoginResponse = 'Failed login.';

const setAuthToken = (res, username) => {
  let expirationSeconds = 60 * 60 * 24 * 7; // one week
  let cookieExpiration = Date.now() + expirationSeconds * 1000;

  // Create token if the password matched and no error was thrown.
  let token = jwt.sign(
    {username},
    config.secret, {
    expiresIn: expirationSeconds
  });

  res.cookie(
    'jwt',
    token,
    {expires: new Date(cookieExpiration), httpOnly: true}
  );

  return res.json({success: true, token: `JWT ${token}`, username});
};

router.post('/authenticate', (req, res) => {
  const credentials = {
    password: req.body.password,
    username: req.body.username
  };

  Users.comparePassword(credentials, (isMatch, err) => {
    if (isMatch == null) {
      // Incorrect username.
      return res.status(401).json({message: failedLoginResponse});
    }

    if (isMatch && !err) {
      return setAuthToken(res, credentials.username);
    } else {
      // Incorrect password.
      return res.status(401).json({message: failedLoginResponse});
    }
  });
});

router.get('/logout', (req, res) => {
  res.clearCookie('jwt').send();
});

// Allow unauthenticated registration if no users are currently registered.
router.use('/register', (req, res, next) => {
  Users.initialUserGate({
    handleInitialUser: () => {
      next();
    },
    handleSubsequentUser: () => {
      // This works:
      // passport.authenticate('jwt', {session: false})(req, res, next);

      passport.authenticate('jwt', {session: false}, (req, res, next) => {
        res.json({username: req.username});
      });
    }
  });
});

router.post('/register', (req, res) => {
  // Attempt to save the user
  Users.createUser(
    {username: req.body.username, password: req.body.password},
    (createUserResponse, createUserError) => {
      if (createUserError) {
        ajaxUtil.getResponseFn(res)(createUserResponse, createUserError);
        return;
      }

      setAuthToken(res, req.body.username);
    }
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
    }
  });
});

router.get('/verify', (req, res, next) => {
  res.json({initialUser: req.initialUser, username: req.user && req.user.username});
});

// All subsequent routes are protected.
router.use('/', passport.authenticate('jwt', {session: false}));

router.get('/users', (req, res, next) => {
  Users.listUsers(ajaxUtil.getResponseFn(res));
});

router.delete('/users/:username', (req, res, next) => {
  Users.removeUser(req.params.username, ajaxUtil.getResponseFn(res));
});

router.put('/users', (req, res, next) => {
  Users.createUser({
    username: req.body.username,
    password: req.body.password
  }, ajaxUtil.getResponseFn(res));
});

module.exports = router;
