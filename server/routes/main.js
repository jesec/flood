'use strict';
let config = require('../../config');
let express = require('express');

let router = express.Router();

router.get('*', (req, res) => {
  res.render(
    'index',
    {
      title: 'Flood',
      basePath: config.basePath || '/',
      maxHistoryStates: config.maxHistoryStates || 30,
      pollInterval: config.pollInterval || 1000 * 5
    }
  );
});

module.exports = router;
