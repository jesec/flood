import {Strategy} from 'passport-jwt';

import type {PassportStatic} from 'passport';
import type {Request} from 'express';

import {authTokenSchema} from '@shared/schema/Auth';

import config from '../../config';
import Users from '../models/Users';

// Setup work and export for the JWT passport strategy.
export default (passport: PassportStatic) => {
  const options = {
    jwtFromRequest: (req: Request) => req?.cookies?.jwt,
    secretOrKey: config.secret,
  };

  passport.use(
    new Strategy(options, (payload, callback) => {
      const parsedResult = authTokenSchema.safeParse(payload);

      if (!parsedResult.success) {
        callback(parsedResult.error, false);
        return;
      }

      Users.lookupUser(parsedResult.data.username).then(
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
