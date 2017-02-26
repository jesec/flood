'use strict';

let ajaxUtil = require('../util/ajaxUtil');
let express = require('express');
let jwt = require('jsonwebtoken');
let multer = require('multer');
let passport = require('passport');

let config = require('../../config');
let router = express.Router();
let Users = require('../models/Users');

const failedLoginResponse = 'Failed login.';

router.post('/authenticate', (req, res) => {
  let credentials = {
    password: req.body.password,
    username: req.body.username
  };

  Users.comparePassword(credentials, (isMatch, err) => {
    if (isMatch == null) {
      // Incorrect username.
      return res.status(401).json({message: failedLoginResponse});
    }

    if (isMatch && !err) {
      let expirationSeconds = 60 * 60 * 24 * 7; // one week
      let cookieExpiration = Date.now() + expirationSeconds * 1000;

      // Create token if the password matched and no error was thrown.
      let token = jwt.sign({username: credentials.username}, config.secret, {
        expiresIn: expirationSeconds
      });

      res.cookie(
        'jwt',
        token,
        {expires: new Date(cookieExpiration), httpOnly: true}
      );

      return res.json({success: true, token: `JWT ${token}`});
    } else {
      // Incorrect password.
      return res.status(401).json({message: failedLoginResponse});
    }
  });
});

// Allow unauthenticated registration if no users are currently registered.
router.use('/register', (req, res, next) => {
  Users.initialUserGate({
    handleInitialUser: next.bind(this),
    handleSubsequentUser: passport.authenticate(
      'jwt',
      {session: false}
    ).bind(this, req, res, next)
  });
});

router.post('/register', (req, res) => {
  // Attempt to save the user
  Users.createUser({
    username: req.body.username,
    password: req.body.password
  }, ajaxUtil.getResponseFn(res));
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
      passport.authenticate(
        'jwt',
        {session: false}
      ).call(this, req, res, next);
    }
  });
});

router.get('/verify', (req, res, next) => {
  res.json({initialUser: req.initialUser});
});

// All subsequent routes are protected.
router.use(
  '/',
  passport.authenticate('jwt', {session: false})
);

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
