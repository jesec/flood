'use strict';

let express = require('express');
let jwt = require('jsonwebtoken');
let multer = require('multer');
let passport = require('passport');

let config = require('../../config');
let router = express.Router();
let Users = require('../models/Users');

// Allow unauthenticated registration if no users are currently registered.
router.use('/register', (req, res, next) => {
  Users.initialUserGate({
    handleInitialUser: next.bind(this),
    handleSubsequentUser: passport.authenticate('jwt', {session: false}).bind(this, req, res, next)
  });
});

router.post('/register', (req, res) => {
  if(!req.body.username || !req.body.password) {
    return res.json({success: false, message: 'Please enter username and password.'});
  } else {
    // Attempt to save the user
    Users.createUser({
      username: req.body.username,
      password: req.body.password
    }, (err, user) => {
      if (err) {
        return res.json({success: false, message: 'That username already exists.'});
      }

      return res.json({success: true, message: `Successfully created new user, ${user.username}.`});
    });
  }
});

router.post('/authenticate', (req, res) => {
  let credentials = {
    password: req.body.password,
    username: req.body.username
  };

  Users.comparePassword(credentials, function(err, isMatch) {
    if (isMatch == null) {
      return res.send({success: false, message: 'Username not found.'});
    }

    if (isMatch && !err) {
      // Create token if the password matched and no error was thrown.
      let token = jwt.sign(credentials, config.secret, {
        expiresIn: 60 * 60 * 24 * 7 // one week
      });
      return res.json({success: true, token: 'JWT ' + token});
    } else {
      return res.send({success: false, message: 'Authentication failed. Passwords did not match.'});
    }
  });
});

module.exports = router;
