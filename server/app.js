'use strict';

require('events').EventEmitter.defaultMaxListeners = Infinity;

let bodyParser = require('body-parser');
let compression = require('compression');
let cookieParser = require('cookie-parser');
let express = require('express');
let favicon = require('serve-favicon');
let morgan = require('morgan');
let passport = require('passport');
let path = require('path');

let app = express();
let apiRoutes = require('./routes/api');
let authRoutes = require('./routes/auth');
let Users = require('./models/Users');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// TODO: Add favicon...
// app.use(favicon(__dirname + '/assets/favicon.ico'));
app.use(morgan('dev'));
app.use(passport.initialize());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'assets')));

require('./config/passport')(passport);

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

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
