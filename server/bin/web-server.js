'use strict';

const startWebServer = () => {
  const chalk = require('chalk');
  const debug = require('debug')('flood:server');
  const fs = require('fs');

  const app = require('../app');
  const config = require('../../config');

  const port = normalizePort(config.floodServerPort);
  const host = config.floodServerHost;
  const useSSL = config.ssl;

  app.set('port', port);
  app.set('host', host);

  // Create HTTP or HTTPS server.
  let server;

  if (useSSL) {
    if (!config.sslKey || !config.sslCert) {
      console.error('Cannot start HTTPS server, `sslKey` or `sslCert`' + ' is missing in config.js.');
      process.exit(1);
    }

    server = require('spdy').createServer(
      {
        key: fs.readFileSync(config.sslKey),
        cert: fs.readFileSync(config.sslCert),
      },
      app
    );
  } else {
    server = require('http').createServer(app);
  }

  // Listen on provided port, on all network interfaces.
  server.listen(port, host);
  server.on('error', onError);
  server.on('listening', onListening);

  // Normalize a port into a number, string, or false.
  function normalizePort(val) {
    let port = parseInt(val, 10);

    // Named pipe.
    if (isNaN(port)) {
      return val;
    }

    // Port number.
    if (port >= 0) {
      return port;
    }

    return false;
  }

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // Handle specific listen errors with friendly messages.
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  // Event listener for HTTP server "listening" event.
  function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
  }

  const address = chalk.underline(`${useSSL ? 'https' : 'http'}://${host}:${port}`);

  console.log(chalk.green(`Flood server starting on ${address}.\n`));
};

module.exports = {startWebServer};
