const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {argv} = require('yargs')
  .env('FLOOD_OPTION_')
  .option('baseuri', {
    default: '/',
    describe: "This URI will prefix all of Flood's HTTP requests",
    type: 'string',
  })
  .option('rundir', {
    alias: 'd',
    default: path.join(os.homedir(), '.local/share/flood'),
    describe: "Where to store Flood's runtime files (eg. database)",
    type: 'string',
  })
  .option('host', {
    alias: 'h',
    default: '127.0.0.1',
    describe: 'The host that Flood should listen for web connections on',
    type: 'string',
  })
  .option('port', {
    alias: 'p',
    default: 3000,
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
    default: false,
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
    conflicts: ['rthost', 'rtport'],
    describe: "Depends on noauth: Path to rTorrent's SCGI unix socket",
    type: 'string',
  })
  .option('ssl', {
    default: false,
    describe: 'Enable SSL, key.pem and fullchain.pem needed in runtime directory',
    type: 'boolean',
  })
  .option('sslkey', {
    describe: 'Depends on ssl: Absolute path to private key for SSL',
    implies: 'ssl',
    hidden: true,
    type: 'string',
  })
  .option('sslcert', {
    describe: 'Depends on ssl: Absolute path to fullchain cert for SSL',
    implies: 'ssl',
    hidden: true,
    type: 'string',
  })
  .option('dbclean', {
    default: 1000 * 60 * 60,
    describe: 'ADVANCED: Interval between database purge',
    hidden: true,
    type: 'number',
  })
  .option('maxhistorystates', {
    default: 30,
    describe: 'ADVANCED: Number of records of torrent download and upload speeds',
    hidden: true,
    type: 'number',
  })
  .option('clientpoll', {
    default: 1000 * 2,
    describe: 'ADVANCED: How often (in ms) Flood will request the torrent list',
    hidden: true,
    type: 'number',
  })
  .option('proxy', {
    default: 'http://127.0.0.1:3000',
    describe: 'DEV ONLY: See the "Local Development" section of README.md',
    hidden: true,
    type: 'string',
  })
  .help();

try {
  fs.mkdirSync(path.join(argv.rundir, 'db'), {recursive: true});
  fs.mkdirSync(path.join(argv.rundir, 'temp'), {recursive: true});
} catch (error) {
  console.error('Failed to access runtime directory');
  process.exit(1);
}

const DEFAULT_SECRET_PATH = path.join(argv.rundir, 'flood.secret');
let secret;

if (!argv.secret) {
  try {
    if (fs.existsSync(DEFAULT_SECRET_PATH)) {
      secret = fs.readFileSync(DEFAULT_SECRET_PATH, {encoding: 'utf8'});
    } else {
      const buf = Buffer.alloc(36);
      crypto.randomFillSync(buf);
      secret = buf.toString('hex');
      fs.writeFileSync(DEFAULT_SECRET_PATH, secret, {mode: 0o600});
    }
  } catch (error) {
    console.error('Failed to read or generate secret');
    process.exit(1);
  }
} else {
  ({secret} = argv);
}

const CONFIG = {
  baseURI: argv.baseuri,
  dbCleanInterval: argv.dbclean,
  dbPath: path.resolve(path.join(argv.rundir, 'db')),
  tempPath: path.resolve(path.join(argv.rundir, 'temp')),
  disableUsersAndAuth: argv.noauth,
  configUser: {
    host: argv.rthost || 'localhost',
    port: argv.rtport || 5000,
    socket: argv.rtsocket != null,
    socketPath: argv.rtsocket || '/data/rtorrent.sock',
  },
  floodServerHost: argv.host,
  floodServerPort: argv.port,
  floodServerProxy: argv.proxy,
  maxHistoryStates: argv.maxhistorystates,
  torrentClientPollInterval: argv.clientpoll,
  secret,
  ssl: argv.ssl,
  sslKey: argv.sslkey || path.resolve(path.join(argv.rundir, 'key.pem')),
  sslCert: argv.sslcert || path.resolve(path.join(argv.rundir, 'fullchain.pem')),
};

module.exports = CONFIG;
