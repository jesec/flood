import chalk from 'chalk';
import debug from 'debug';
import fs from 'fs';
import http from 'http';
import spdy from 'spdy';

import app from '../app';
import config from '../../config';

const debugFloodServer = debug('flood:server');

// Normalize a port into a number, string, or false.
const normalizePort = (val: string | number): string | number => {
  const port = parseInt(val as string, 10);

  // Named pipe.
  if (Number.isNaN(port)) {
    return val;
  }

  // Port number.
  if (port >= 0) {
    return port;
  }

  console.error('Unexpected port or pipe');
  process.exit(1);
};

export const startWebServer = () => {
  const port = normalizePort(config.floodServerPort);
  const host = config.floodServerHost;
  const useSSL = config.ssl;

  app.set('port', port);
  app.set('host', host);

  // Create HTTP or HTTPS server.
  let server: http.Server | spdy.Server;

  if (useSSL) {
    if (!config.sslKey || !config.sslCert) {
      console.error('Cannot start HTTPS server, `sslKey` or `sslCert` is missing in config.js.');
      process.exit(1);
    }

    server = spdy.createServer(
      {
        key: fs.readFileSync(config.sslKey),
        cert: fs.readFileSync(config.sslCert),
      },
      app,
    );
  } else {
    server = http.createServer(app);
  }

  const handleError = (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // Handle specific listen errors with friendly messages.
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  };

  // Event listener for HTTP server "listening" event.
  const handleListening = () => {
    const addr = server.address();
    if (addr == null) {
      console.error('Unable to get listening address.');
      process.exit(1);
    }
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    debugFloodServer(`Listening on ${bind}`);
  };

  // Listen on provided port, on all network interfaces.
  if (typeof port === 'string') {
    server.listen(port);
  } else {
    server.listen(port, host);
  }

  server.on('error', handleError);
  server.on('listening', handleListening);

  const address = chalk.underline(`${useSSL ? 'https' : 'http'}://${host}:${port}`);

  console.log(chalk.green(`Flood server starting on ${address}.\n`));

  if (config.disableUsersAndAuth) {
    console.log(chalk.yellow('Starting without builtin authentication\n'));
  }
};
