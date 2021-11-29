import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import fs from 'fs';
import morgan from 'morgan';
import passport from 'passport';
import path from 'path';
import {Strategy} from 'passport-jwt';

import type {Request} from 'express';

import {authTokenSchema} from '@shared/schema/Auth';
import paths from '@shared/config/paths';

import type {UserInDatabase} from '@shared/schema/Auth';

import apiRoutes from './routes/api';
import config from '../config';
import Users from './models/Users';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends UserInDatabase {}
  }
}

Users.bootstrapServicesForAllUsers();

const app = express();
const servedPath = config.baseURI.endsWith('/') ? config.baseURI : `${config.baseURI}/`;

// Remove Express header
if (process.env.NODE_ENV !== 'development') {
  app.disable('x-powered-by');
}

app.set('strict routing', true);
app.set('trust proxy', 'loopback');

app.use(morgan('dev'));

if (config.serveAssets !== false) {
  // Disable ETag
  app.set('etag', false);

  // Enable compression
  app.use(compression());

  // Static assets
  app.use(servedPath, express.static(paths.appDist));

  // Client app routes, serve index.html and client js will figure it out
  const html = fs.readFileSync(path.join(paths.appDist, 'index.html'), {
    encoding: 'utf8',
  });

  // Prohibit caching of index.html as browser can use a fully cached asset
  // tree in some cases, which defeats cache busting by asset hashes.
  const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  };

  app.get(`${servedPath}login`, (_req, res) => {
    res.set(headers);
    res.send(html);
  });

  app.get(`${servedPath}register`, (_req, res) => {
    res.set(headers);
    res.send(html);
  });

  app.get(`${servedPath}overview`, (_req, res) => {
    res.set(headers);
    res.send(html);
  });
} else {
  // no-op res.flush() as compression is not handled by Express
  app.use((_req, res, next) => {
    res.flush = () => {
      // do nothing.
    };
    next();
  });
}

app.use(passport.initialize());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
app.use(cookieParser());

passport.use(
  new Strategy(
    {
      jwtFromRequest: (req: Request) => req?.cookies?.jwt,
      secretOrKey: config.secret,
    },
    (payload, callback) => {
      const parsedResult = authTokenSchema.safeParse(payload);

      if (!parsedResult.success) {
        callback(parsedResult.error, false);
        return;
      }

      Users.lookupUser(parsedResult.data.username).then(
        (user) => {
          if (user?.timestamp <= parsedResult.data.iat + 10) {
            callback(null, user);
          } else {
            callback(new Error(), false);
          }
        },
        (err) => {
          callback(err, false);
        },
      );
    },
  ),
);

app.use(`${servedPath}api`, apiRoutes);

export default app;
