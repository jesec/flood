var express = require('express');
var xmlrpc = require('xmlrpc');
var router = express.Router();
var clientStats = require('../models/clientStats')();

router.get('/', function(req, res, next) {

});

router.get('/stats', function(req, res, next) {

    clientStats.getStats(function(error, results) {
        res.json(results);
    });

});

module.exports = router;
