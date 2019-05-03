const JwtStrategy = require('passport-jwt').Strategy;

const config = require('../../config');
const Users = require('../models/Users');

// Setup work and export for the JWT passport strategy.
module.exports = passport => {
  const options = {
    jwtFromRequest: req => {
      let token = null;

      if (req && req.cookies) {
        token = req.cookies.jwt;
      }

      return token;
    },
    secretOrKey: config.secret,
  };

  passport.use(
    new JwtStrategy(options, (jwtPayload, callback) => {
      Users.lookupUser({username: jwtPayload.username}, (err, user) => {
        if (err) {
          return callback(err, false);
        }

        if (user) {
          return callback(null, user);
        }

        return callback(null, false);
      });
    }),
  );
};
