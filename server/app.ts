import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, {Request, Response, NextFunction, ErrorRequestHandler} from 'express';
import fs from 'fs';
import createHttpError, {HttpError} from 'http-errors';
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
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(passport.initialize());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

passportConfig(passport);

app.use(path.join(paths.servedPath, 'api'), apiRoutes);
app.use(path.join(paths.servedPath, 'auth'), authRoutes);

// After routes, look for static assets.
app.use(paths.servedPath, express.static(paths.appBuild));

// Client app routes, serve index.html and client js will figure it out
const html = fs.readFileSync(path.join(paths.appBuild, 'index.html'), {encoding: 'utf8'});

app.get(path.join(paths.servedPath, 'login'), (_req, res) => {
  res.send(html);
});

app.get(path.join(paths.servedPath, 'register'), (_req, res) => {
  res.send(html);
});

app.get(path.join(paths.servedPath, 'overview'), (_req, res) => {
  res.send(html);
});

// Catch 404 and forward to error handler.
app.use((_req, _res, next) => {
  const err = createHttpError('Not Found');
  err.status = 404;
  next(err);
});

// Production error handler, no stacktrace leaked to user.
let errorRequestHandler: ErrorRequestHandler = (err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    title: 'Flood Error',
  });
};

// Development error handler, will print stacktrace.
if (app.get('env') === 'development') {
  errorRequestHandler = (err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: 'Flood Error',
    });
  };
}

// Error handler.
app.use(errorRequestHandler);

export default app;
