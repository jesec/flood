var express = require('express');
var passport = require('passport');
var router = express.Router();
var Strategy = require('passport-http').BasicStrategy;

var users = require('../db/users');

passport.use(new Strategy(
  function(username, password, callback) {
    users.findByUsername(username, function(err, user) {
      if (err) { return callback(err); }
      if (!user) { return callback(null, false); }
      if (user.password != password) { return callback(null, false); }
      return callback(null, user);
    });
  }
));

router.get('/', passport.authenticate('basic', { session: false }),
  function(req, res) {
    res.render('index', { title: 'Flood' });
    // res.json({ username: req.user.username, email: req.user.emails[0].value });
  }
);

module.exports = router;
