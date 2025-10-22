const os = require('node:os');
const net = require('node:net');
const chalk = require('chalk');
const url = require('node:url');

// Get local IP address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

function prepareUrls(protocol, host, port, pathname = '/') {
  const formatUrl = (hostname) =>
    url.format({
      protocol,
      hostname,
      port,
      pathname,
    });
  const prettyPrintUrl = (hostname) =>
    url.format({
      protocol,
      hostname,
      port: chalk.bold(port),
      pathname,
    });

  const isUnspecifiedHost = host === '0.0.0.0' || host === '::';
  let prettyHost, lanUrlForConfig, lanUrlForTerminal;
  if (isUnspecifiedHost) {
    prettyHost = 'localhost';
    try {
      lanUrlForConfig = getLocalIPAddress();
      if (lanUrlForConfig) {
        if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(lanUrlForConfig)) {
          lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
        } else {
          lanUrlForConfig = undefined;
        }
      }
    } catch {
      // ignored
    }
  } else {
    prettyHost = host;
  }
  const localUrlForTerminal = prettyPrintUrl(prettyHost);
  const localUrlForBrowser = formatUrl(prettyHost);
  return {
    lanUrlForConfig,
    lanUrlForTerminal,
    localUrlForTerminal,
    localUrlForBrowser,
  };
}

// Simple port detection
function choosePort(host, defaultPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use, try the next one
        console.log(chalk.yellow(`Port ${defaultPort} is already in use.`));
        // Try next port
        choosePort(host, defaultPort + 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });

    server.once('listening', () => {
      const port = server.address().port;
      server.close(() => {
        if (port !== defaultPort) {
          const message =
            process.platform !== 'win32' && defaultPort < 1024 && !isRoot()
              ? 'Admin permissions are required to run a server on a port below 1024.'
              : `Something is already running on port ${defaultPort}.`;
          console.log(chalk.yellow(message));
        }
        resolve(port);
      });
    });

    server.listen(defaultPort, host);
  });
}

function isRoot() {
  return process.getuid && process.getuid() === 0;
}

module.exports = {
  choosePort,
  prepareUrls,
};
