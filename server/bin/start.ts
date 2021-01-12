#!/usr/bin/env node

import chalk from 'chalk';

import enforcePrerequisites from './enforce-prerequisites';
import migrateData from './migrations/run';

if (process.env.NODE_ENV !== 'development') {
  // Use production mode by default
  process.env.NODE_ENV = 'production';

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
    process.exit(1);
  });
}

enforcePrerequisites()
  .then(migrateData)
  .then(() => {
    // We do this because we don't want the side effects of importing server functions before migration is completed.
    const startWebServer = require('./web-server').default; // eslint-disable-line @typescript-eslint/no-var-requires
    return startWebServer();
  })
  .catch((error) => {
    console.log(chalk.red('Failed to start Flood:'));
    console.trace(error);
    process.exit(1);
  });
