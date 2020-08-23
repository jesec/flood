require('events').EventEmitter.defaultMaxListeners = Infinity;

const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');

const app = express();
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const paths = require('../shared/config/paths');
const Users = require('./models/Users');

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

require('./config/passport')(passport);

app.use(path.join(paths.servedPath, 'api'), apiRoutes);
app.use(path.join(paths.servedPath, 'auth'), authRoutes);

// After routes, look for static assets.
app.use(paths.servedPath, express.static(paths.appBuild));

app.use((req, res, next) => {
  // If request URL starts with baseURI
  if (req.url.startsWith(paths.servedPath)) {
    // Always return index.html
    res.sendFile(path.join(paths.appBuild, 'index.html'));
  } else {
    // Catch 404 and forward to error handler.
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

// Development error handler, will print stacktrace.
if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: 'Flood Error',
    });
  });
} else {
  // Production error handler, no stacktraces leaked to user.
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
      title: 'Flood Error',
    });
  });
}

module.exports = app;
