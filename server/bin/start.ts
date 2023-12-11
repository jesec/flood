#!/usr/bin/env node

import chalk from 'chalk';

import enforcePrerequisites from './enforce-prerequisites';
import migrateData from './migrations/run';
import startWebServer from './web-server';

if (process.env.NODE_ENV == 'production') {
  // Catch unhandled rejections and exceptions
  // Traces are pretty useless with minimized production codes
  // This avoids printing a large section of junk
  const message = 'FATAL internal error. Please open an issue.';

  process.on('unhandledRejection', (reason) => {
    console.error(message);
    console.error(`Unhandled rejection: ${(reason as Error)?.message ?? reason}`);
    process.exit(1);
  });

  process.on('uncaughtException', (error) => {
    console.error(message);
    console.error(`Uncaught exception: ${error.name}: ${error.message}`);
    console.error(`stack trace: ${error.stack}`);
    process.exit(1);
  });
}

enforcePrerequisites()
  .then(migrateData)
  .then(startWebServer)
  .catch((error) => {
    console.log(chalk.red('Failed to start Flood:'));
    console.trace(error);
    process.exit(1);
  });
