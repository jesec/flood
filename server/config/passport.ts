import {Strategy} from 'passport-jwt';

import type {PassportStatic} from 'passport';
import type {Request} from 'express';

import config from '../../config';
import Users from '../models/Users';

// Setup work and export for the JWT passport strategy.
export default (passport: PassportStatic) => {
  const options = {
    jwtFromRequest: (req: Request) => {
      let token = null;

      if (req && req.cookies) {
        token = req.cookies.jwt;
      }

      return token;
    },
    secretOrKey: config.secret,
  };

  passport.use(
    new Strategy(options, (jwtPayload, callback) => {
      Users.lookupUser(jwtPayload.username).then(
        (user) => {
          callback(null, user);
        },
        (err) => {
          callback(err, false);
        },
      );
    }),
  );
};
