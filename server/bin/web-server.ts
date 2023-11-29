import chalk from 'chalk';
import debug from 'debug';
import fs from 'fs';
import http from 'http';
import https from 'https';

import app from '../app';
import config from '../../config';
import packageJSON from '../../package.json';

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

const startWebServer = () => {
  const port = normalizePort(config.floodServerPort);
  const host = config.floodServerHost;
  const useSSL = config.ssl ?? false;

  app.set('port', port);
  app.set('host', host);

  // Create HTTP or HTTPS server.
  let server: http.Server | https.Server;

  if (useSSL) {
    if (!config.sslKey || !config.sslCert) {
      console.error('Cannot start HTTPS server, `sslKey` or `sslCert` is missing in config.js.');
      process.exit(1);
    }

    server = https.createServer(
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
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
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
  process.on('exit', () => {
    server.close();
  });

  const address = chalk.underline(typeof port === 'string' ? port : `${useSSL ? 'https' : 'http'}://${host}:${port}`);

  console.log(chalk.green(`Flood server ${packageJSON.version} starting on ${address}\n`));

  if (config.authMethod === 'none') {
    console.log(chalk.yellow('Starting without builtin authentication\n'));
  }

  if (config.serveAssets === false) {
    console.log(chalk.blue('Static assets not served\n'));
  }
};

export default startWebServer;
