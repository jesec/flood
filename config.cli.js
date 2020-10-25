const {spawn} = require('child_process');
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
  .option('httpauth', {
    conflicts: ['rthost', 'rtport', 'rtsocket'],
    default: false,
    describe: "Enable Flood's builtin access control system to read auth data from HTTP basic auth.",
    type: 'boolean',
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
  .option('qburl', {
    describe: 'Depends on noauth: URL to qBittorrent Web API',
    type: 'string',
  })
  .option('qbuser', {
    describe: 'Depends on noauth: Username of qBittorrent Web API',
    type: 'string',
  })
  .option('qbpass', {
    describe: 'Depends on noauth: Password of qBittorrent Web API',
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
  .option('allowedpath', {
    describe: 'Allowed path for file operations, can be called multiple times',
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
  .option('clientpollidle', {
    default: 1000 * 60 * 15,
    describe: 'ADVANCED: How often (in ms) Flood will request the torrent list when no user is present',
    hidden: true,
    type: 'number',
  })
  .option('rtorrent', {
    default: false,
    describe: 'ADVANCED: rTorrent daemon managed by Flood',
    hidden: true,
    type: 'boolean',
  })
  .option('proxy', {
    default: 'http://127.0.0.1:3000',
    describe: 'DEV ONLY: See the "Local Development" section of README.md',
    hidden: true,
    type: 'string',
  })
  .version(require('./package.json').version)
  .alias('v', 'version')
  .help();

if (argv.rtorrent) {
  const rTorrentProcess = spawn('rtorrent', ['-o', 'system.daemon.set=true']);
  process.on('exit', () => {
    console.log('Killing rTorrent daemon...');
    rTorrentProcess.kill('SIGTERM');
  });
}

process.on('SIGINT', () => {
  process.exit();
});

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

let connectionSettings;
if (argv.rtsocket != null || argv.rthost != null) {
  if (argv.rtsocket != null) {
    connectionSettings = {
      client: 'rTorrent',
      type: 'socket',
      version: 1,
      socket: argv.rtsocket,
    };
  } else {
    connectionSettings = {
      client: 'rTorrent',
      type: 'tcp',
      version: 1,
      host: argv.rthost,
      port: argv.rtport,
    };
  }
} else if (argv.qburl != null) {
  connectionSettings = {
    client: 'qBittorrent',
    type: 'web',
    version: 1,
    url: argv.qburl,
    username: argv.qbuser,
    password: argv.qbpass,
  };
}

const CONFIG = {
  baseURI: argv.baseuri,
  dbCleanInterval: argv.dbclean,
  dbPath: path.resolve(path.join(argv.rundir, 'db')),
  tempPath: path.resolve(path.join(argv.rundir, 'temp')),
  disableUsersAndAuth: argv.noauth,
  enableUsersHTTPBasicAuthHandler: argv.httpauth,
  configUser: connectionSettings,
  floodServerHost: argv.host,
  floodServerPort: argv.port,
  floodServerProxy: argv.proxy,
  maxHistoryStates: argv.maxhistorystates,
  torrentClientPollInterval: argv.clientpoll,
  torrentClientPollIntervalIdle: argv.clientpollidle,
  secret,
  ssl: argv.ssl,
  sslKey: argv.sslkey || path.resolve(path.join(argv.rundir, 'key.pem')),
  sslCert: argv.sslcert || path.resolve(path.join(argv.rundir, 'fullchain.pem')),
  allowedPaths: argv.allowedpath ? [].concat(argv.allowedpath) : null,
};

module.exports = CONFIG;
