#!/usr/bin/env node

import {createLogger} from '../util/logger';
import enforcePrerequisites from './enforce-prerequisites';
import migrateData from './migrations/run';
import startWebServer from './web-server';

const logger = createLogger('start');

if (process.env.NODE_ENV == 'production') {
  // Catch unhandled rejections and exceptions
  // Traces are pretty useless with minimized production codes
  // This avoids printing a large section of junk
  const message = 'FATAL internal error. Please open an issue.';

  process.on('unhandledRejection', (reason) => {
    logger.fatal({error: reason as Error}, `${message} Unhandled rejection.`);
    process.exit(1);
  });

  process.on('uncaughtException', (error) => {
    logger.fatal({error}, `${message} Uncaught exception.`);
    process.exit(1);
  });
}

const main = async () => {
  await enforcePrerequisites();
  await migrateData();
  await startWebServer();
};

main().catch((error) => {
  logger.fatal({error}, `Failed to start Flood ${error}`);
  process.exit(1);
});
