import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import fs from 'fs';
import morgan from 'morgan';
import passport from 'passport';
import path from 'path';

import apiRoutes from './routes/api';
import authRoutes from './routes/auth';
import passportConfig from './config/passport';
import paths from '../shared/config/paths';
import Users from './models/Users';

const app = express();

Users.bootstrapServicesForAllUsers();

// Remove Express header
if (process.env.NODE_ENV !== 'development') {
  app.disable('x-powered-by');
}

app.set('etag', false);

app.use(morgan('dev'));
app.use(passport.initialize());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

passportConfig(passport);

app.use(`${paths.servedPath}api`, apiRoutes);
app.use(`${paths.servedPath}auth`, authRoutes);

// After routes, look for static assets.
app.use(paths.servedPath, express.static(paths.appDist));

// Client app routes, serve index.html and client js will figure it out
const html = fs.readFileSync(path.join(paths.appDist, 'index.html'), {encoding: 'utf8'});

app.get(`${paths.servedPath}login`, (_req, res) => {
  res.send(html);
});

app.get(`${paths.servedPath}register`, (_req, res) => {
  res.send(html);
});

app.get(`${paths.servedPath}overview`, (_req, res) => {
  res.send(html);
});

export default app;
