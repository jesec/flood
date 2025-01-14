import {spawn} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import type {Config} from '@shared/schema/Config';
import {configSchema} from '@shared/schema/Config';
import yargs from 'yargs/yargs';

import {version} from './package.json';

const {argv: argvObj} = yargs(process.argv.slice(2))
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
    type: 'string',
  })
  .option('secret', {
    alias: 's',
    hidden: true,
    describe: 'A unique secret, a random one will be generated if not provided',
    type: 'string',
  })
  .option('auth', {
    describe: 'Access control and user management method',
    choices: ['default', 'none'],
  })
  .option('noauth', {
    alias: 'n',
    hidden: true,
    default: false,
    describe: "Disable Flood's builtin access control system, deprecated, use auth=none instead",
    type: 'boolean',
  })
  .option('disable-rate-limit', {
    default: false,
    describe: 'disable api request limit except for login',
    hidden: true,
    type: 'boolean',
  })
  .option('dehost', {
    describe: 'Host of Deluge RPC interface',
    type: 'string',
  })
  .option('deport', {
    describe: 'Port of Deluge RPC interface',
    type: 'number',
  })
  .option('deuser', {
    describe: 'Username of Deluge RPC interface',
    type: 'string',
  })
  .option('depass', {
    describe: 'Password of Deluge RPC interface',
    type: 'string',
  })
  .option('rthost', {
    describe: "Host of rTorrent's SCGI interface",
    type: 'string',
  })
  .option('rtport', {
    describe: "Port of rTorrent's SCGI interface",
    type: 'number',
  })
  .option('rtsocket', {
    conflicts: ['rthost', 'rtport'],
    describe: "Path to rTorrent's SCGI unix socket",
    type: 'string',
  })
  .option('qburl', {
    describe: 'URL to qBittorrent Web API',
    type: 'string',
  })
  .option('qbuser', {
    describe: 'Username of qBittorrent Web API',
    type: 'string',
  })
  .option('qbpass', {
    describe: 'Password of qBittorrent Web API',
    type: 'string',
  })
  .option('trurl', {
    describe: 'URL to Transmission RPC interface',
    type: 'string',
  })
  .option('truser', {
    describe: 'Username of Transmission RPC interface',
    type: 'string',
  })
  .option('trpass', {
    describe: 'Password of Transmission RPC interface',
    type: 'string',
  })
  .group(
    [
      'dehost',
      'deport',
      'deuser',
      'depass',
      'rthost',
      'rtport',
      'rtsocket',
      'qburl',
      'qbuser',
      'qbpass',
      'trurl',
      'truser',
      'trpass',
    ],
    'When auth=none:',
  )
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
  .option('assets', {
    default: true,
    describe: 'ADVANCED: Serve static assets',
    hidden: true,
    type: 'boolean',
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
  .option('rtconfig', {
    describe: 'ADVANCED: rtorrent.rc for managed rTorrent daemon',
    implies: 'rtorrent',
    hidden: true,
    type: 'string',
  })
  .option('test', {
    default: false,
    describe: 'DEV ONLY: Test setup',
    hidden: true,
    type: 'boolean',
  })
  .version(version)
  .alias('v', 'version')
  .help();

// HACK: pending yargs/yargs#2175
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const argv = argvObj as Record<string, any>;

process.on('SIGINT', () => {
  process.exit();
});

try {
  fs.mkdirSync(path.join(argv.rundir), {recursive: true, mode: 0o700});
  fs.mkdirSync(path.join(argv.rundir, 'db'), {recursive: true});
  fs.mkdirSync(path.join(argv.rundir, 'temp'), {recursive: true});
} catch (error) {
  console.error('Failed to access runtime directory', error);
  process.exit(1);
}

if (argv.rtorrent) {
  const args = [];
  let opts = 'system.daemon.set=true';

  if (typeof argv.rtconfig === 'string' && argv.rtconfig.length > 0) {
    args.push('-n');
    opts += `,import=${argv.rtconfig}`;
  }

  const rTorrentProcess = spawn('rtorrent', args.concat(['-o', opts]), {stdio: 'inherit'});

  fs.writeFileSync(path.join(argv.rundir, 'rtorrent.pid'), `${rTorrentProcess.pid}`);

  if (!argv.test) {
    rTorrentProcess.on('close', () => {
      process.exit(1);
    });
    rTorrentProcess.on('error', () => {
      process.exit(1);
    });
  }

  process.on('exit', () => {
    console.log('Killing rTorrent daemon...');
    rTorrentProcess.kill('SIGHUP');
  });
}

const DEFAULT_SECRET_PATH = path.join(argv.rundir, 'flood.secret');
let secret: string;

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

let connectionSettings: Partial<ClientConnectionSettings> | undefined;
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
} else if (argv.trurl != null) {
  connectionSettings = {
    client: 'Transmission',
    type: 'rpc',
    version: 1,
    url: argv.trurl,
    username: argv.truser,
    password: argv.trpass,
  };
} else if (argv.dehost != null) {
  connectionSettings = {
    client: 'Deluge',
    type: 'rpc',
    version: 1,
    host: argv.dehost,
    port: argv.deport,
    username: argv.deuser,
    password: argv.depass,
  };
}

let authMethod: Config['authMethod'] = 'default';
if (argv.noauth || argv.auth === 'none') {
  authMethod = 'none';
}

let allowedPaths: string[] = [];
if (typeof argv.allowedpath === 'string') {
  allowedPaths = allowedPaths.concat(argv.allowedpath.split(','));
} else if (Array.isArray(argv.allowedpath)) {
  allowedPaths = allowedPaths.concat(argv.allowedpath);
}

const result = configSchema.safeParse({
  baseURI: argv.baseuri,
  dbCleanInterval: argv.dbclean,
  dbPath: path.resolve(path.join(argv.rundir, 'db')),
  tempPath: path.resolve(path.join(argv.rundir, 'temp')),
  authMethod,
  configUser: connectionSettings,
  floodServerHost: argv.host,
  floodServerPort: argv.port,
  maxHistoryStates: argv.maxhistorystates,
  torrentClientPollInterval: argv.clientpoll,
  torrentClientPollIntervalIdle: argv.clientpollidle,
  secret,
  ssl: argv.ssl,
  sslKey: argv.sslkey || path.resolve(path.join(argv.rundir, 'key.pem')),
  sslCert: argv.sslcert || path.resolve(path.join(argv.rundir, 'fullchain.pem')),
  allowedPaths: allowedPaths.length > 0 ? allowedPaths : undefined,
  serveAssets: argv.assets,
  disableRateLimit: argv.disableRateLimit,
});

if (!result.success) {
  console.error(`Invalid configuration: ${result.error.message}`);
  process.exit(1);
}

export default result.data;
