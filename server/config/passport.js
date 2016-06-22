'use strict';

let extractJWT = require('passport-jwt').ExtractJwt;
let jwtStrategy = require('passport-jwt').Strategy;

let config = require('../../config');
let Users = require('../models/Users');

// Setup work and export for the JWT passport strategy
module.exports = (passport) => {
  let options = {
    jwtFromRequest: extractJWT.fromAuthHeader(),
    secretOrKey: config.secret
  };

  passport.use(new jwtStrategy(options, (jwtPayload, callback) => {
    Users.lookupUser({username: jwtPayload.username}, (err, user) => {
      if (err) {
        return callback(err, false);
      }

      if (user) {
        return callback(null, user);
      }

      return callback(null, false);
    });
  }));
};
