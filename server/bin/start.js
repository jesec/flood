'use strict';
const chalk = require('chalk');

const enforcePrerequisites = require('./enforce-prerequisites');
const migrateData = require('./migrations/run');
const {startWebServer} = require('./web-server');

enforcePrerequisites()
  .then(migrateData)
  .then(startWebServer)
  .catch(error => {
    console.log(chalk.red('Failed to start Flood:'));
    console.trace(error);
    process.exit(1);
  });
