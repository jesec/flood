#!/usr/bin/env node

import chalk from 'chalk';

import enforcePrerequisites from './enforce-prerequisites';
import migrateData from './migrations/run';
import startWebServer from './web-server';

process.env.NODE_ENV = process.env.NODE_ENV !== 'development' ? 'production' : 'development';

enforcePrerequisites()
  .then(migrateData)
  .then(startWebServer)
  .catch((error) => {
    console.log(chalk.red('Failed to start Flood:'));
    console.trace(error);
    process.exit(1);
  });
