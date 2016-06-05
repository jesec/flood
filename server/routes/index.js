'use strict';

var express = require('express');
var passport = require('passport');
var router = express.Router();
var Strategy = require('passport-http').BasicStrategy;

let ajaxUtil = require('../util/ajaxUtil');
let client = require('../models/client');
let history = require('../models/history');
let settings = require('../models/settings');
var users = require('../db/users');

history.startPolling();

passport.use(new Strategy(
  (username, password, callback) => {
    users.findByUsername(username, (err, user) => {
      if (err) { return callback(err); }
      if (!user) { return callback(null, false); }
      if (user.password != password) { return callback(null, false); }
      return callback(null, user);
    });
  }
));

router.get('/', passport.authenticate('basic', { session: false }),
  (req, res) => {
    res.render('index', { title: 'Flood' });
  }
);

router.get('/history', function(req, res, next) {
  history.get(req.query, ajaxUtil.getResponseFn(res));
});

router.get('/settings', function(req, res, next) {
  settings.get(req.query, ajaxUtil.getResponseFn(res));
});

router.patch('/settings', function(req, res, next) {
  settings.set(req.body, ajaxUtil.getResponseFn(res));
});

router.get('/stats', function(req, res, next) {
  client.getTransferStats(ajaxUtil.getResponseFn(res));
});

module.exports = router;
