const { mkdirSync } = require('fs');
const path = require('path');
const yargs = require('yargs');

const { argv } = yargs
  .option('baseuri', {
    type: 'string',
  })
  .option('rundir', {
    alias: 'd',
    type: 'string',
  })
  .option('host', {
    alias: 'h',
    type: 'string',
  })
  .option('port', {
    alias: 'p',
    type: 'number',
  })
  .option('secret', {
    alias: 's',
    type: 'string',
  })
  .option('noauth', {
    alias: 'n',
    type: 'boolean',
  })
  .option('rthost', {
    type: 'string',
  })
  .option('rtport', {
    type: 'number',
  })
  .option('rtsocket', {
    type: 'string',
  })
  .help();

if (!argv.secret) {
  console.error('Secret must be provided.')
  process.exit(1);
}

try {
  mkdirSync(path.join(argv.rundir ? argv.rundir : './run', 'db'), { recursive: true });
  mkdirSync(path.join(argv.rundir ? argv.rundir : './run', 'temp'), { recursive: true });
} catch (error) {
  console.error('Failed to access runtime directory');
  process.exit(1);
}

const CONFIG = {
  baseURI: argv.baseuri || '/',
  dbCleanInterval: 1000 * 60 * 60,
  dbPath: path.resolve(path.join(argv.rundir ? argv.rundir : "./run", 'db')),
  tempPath: path.resolve(path.join(argv.rundir ? argv.rundir : "./run", 'temp')),
  disableUsersAndAuth: argv.noauth || false,
  configUser: {
    host: argv.rthost || 'localhost',
    port: argv.rtport || 5000,
    socket: argv.rtsocket != null,
    socketPath: argv.rtsocket || '/data/rtorrent.sock',
  },
  floodServerHost: argv.host || '127.0.0.1',
  floodServerPort: argv.port || 3000,
  maxHistoryStates: 30,
  torrentClientPollInterval: 1000 * 2,
  secret: argv.secret,
  ssl: false,
  sslKey: '/absolute/path/to/key/',
  sslCert: '/absolute/path/to/certificate/',
};

module.exports = CONFIG;
