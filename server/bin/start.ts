#!/usr/bin/env node

import chalk from 'chalk';

import enforcePrerequisites from './enforce-prerequisites';
import migrateData from './migrations/run';

process.env.NODE_ENV = process.env.NODE_ENV !== 'development' ? 'production' : 'development';

enforcePrerequisites()
  .then(migrateData)
  .then(() => {
    // We do this because we don't want the side effects of importing server functions before migration is completed.
    const startWebServer = require('./web-server').default; // eslint-disable-line global-require
    return startWebServer();
  })
  .catch((error) => {
    console.log(chalk.red('Failed to start Flood:'));
    console.trace(error);
    process.exit(1);
  });
