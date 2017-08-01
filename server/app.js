'use strict';

require('events').EventEmitter.defaultMaxListeners = Infinity;

const torrentService = require('./services/torrentService');

const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');

const app = express();
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const paths = require('../client/config/paths');
const Users = require('./models/Users');

app.set('views', path.join(__dirname, 'views'));

// Remove Express header
if(process.env.NODE_ENV !== 'development') {
  app.disable('x-powered-by');
}

app.use(morgan('dev'));
app.use(passport.initialize());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'assets')));

require('./config/passport')(passport);

app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
// Serve static assets from build path.
app.use(express.static(paths.appBuild));
// Serve the built index.html file regardless of request, if it didn't match yet.
app.get('*', (req, res) => {
  res.sendFile(path.resolve(paths.appBuild, 'index.html'));
});

// Catch 404 and forward to error handler.
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Development error handler, will print stacktrace.
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
} else {
  // Production error handler, no stacktraces leaked to user.
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
}

module.exports = app;
