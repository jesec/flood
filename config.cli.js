const fs = require('fs');
const os = require('os');
const path = require('path');
const {argv} = require('yargs')
  .option('baseuri', {
    describe: "This URI will prefix all of Flood's HTTP requests",
    type: 'string',
  })
  .option('rundir', {
    alias: 'd',
    describe: "Where to store Flood's runtime files (eg. database)",
    type: 'string',
  })
  .option('host', {
    alias: 'h',
    describe: 'The host that Flood should listen for web connections on',
    type: 'string',
  })
  .option('port', {
    alias: 'p',
    describe: 'The port that Flood should listen for web connections on',
    type: 'number',
  })
  .option('secret', {
    alias: 's',
    describe: 'A unique secret, a random one will be generated if not provided',
    type: 'string',
  })
  .option('noauth', {
    alias: 'n',
    describe: "Disable Flood's builtin access control system, needs rthost+rtport OR rtsocket.",
    type: 'boolean',
  })
  .option('rthost', {
    describe: "Depends on noauth: Host of rTorrent's SCGI interface",
    type: 'string',
  })
  .option('rtport', {
    describe: "Depends on noauth: Port of rTorrent's SCGI interface",
    type: 'number',
  })
  .option('rtsocket', {
    describe: "Depends on noauth: Path to rTorrent's SCGI unix socket",
    type: 'string',
  })
  .help();

if (!argv.secret) {
  console.error('Secret must be provided.')
  process.exit(1);
}

const DEFAULT_RUNDIR = path.join(os.homedir(), '.local/share/flood');
const RUNDIR = argv.rundir ? argv.rundir : DEFAULT_RUNDIR;

try {
  fs.mkdirSync(path.join(RUNDIR, 'db'), {recursive: true});
  fs.mkdirSync(path.join(RUNDIR, 'temp'), {recursive: true});
} catch (error) {
  console.error('Failed to access runtime directory');
  process.exit(1);
}

const CONFIG = {
  baseURI: argv.baseuri || '/',
  dbCleanInterval: 1000 * 60 * 60,
  dbPath: path.resolve(path.join(RUNDIR, 'db')),
  tempPath: path.resolve(path.join(RUNDIR, 'temp')),
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
