import {Strategy as JwtStrategy} from 'passport-jwt';

import config from '../../config';
import Users from '../models/Users';

// Setup work and export for the JWT passport strategy.
export default (passport) => {
  const options = {
    jwtFromRequest: (req) => {
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
