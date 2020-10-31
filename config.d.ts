// This is the config schema for Flood, a React-based frontend for various BitTorrent clients.
// This file provides the detailed documentation for config options.
//
// By default, <rundir> is ~/.local/share/flood.
//
// You may use this schema to create a static configuration. However, it is not recommended.
// Stability of this schema can NOT be guaranteed. The reason is that other files import
// config.js and use its variables directly and it would involve unnecessary and duplicative
// conditionals in EVERY related file in order to retain compatibility for older config files.
// Plus, such duplications and conditionals are error-prone.
//
// Use CLI if you don't want to check and change the config.js whenever Flood is updated.

import type {AuthMethod} from '@shared/schema/Auth';
import type {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';

declare const CONFIG: {
  // This URI will prefix all of Flood's HTTP requests.
  // For example, if you intend to serve from http://example.com/flood, set this to
  // '/flood' and configure your web server to pass _all_ requests from `/flood` to
  // the `/flood` of Flood's web server. [default: '/']
  baseURI: string;

  // Flood uses a local nedb database to keep track of users, torrents, and activity. The
  // database is regularly purged to remove outdated data. This value dictates how old data
  // is, in milliseconds, before being purged. [default: 1000 * 60 * 60]
  dbCleanInterval: number;

  // Where to store the local nedb database. [default: '<rundir>/db']
  dbPath: string;

  // Where to store Flood's temporary files [default: '<rundir>/temp']
  tempPath: string;

  // Authentication and user management method: [default: 'default']
  //
  // default:
  //  Flood uses its own authentication and user management system. Users are authenticated
  //  by password and will be prompted to configure the connection to torrent client in the
  //  web interface. On successful authentication via /authenticate API endpoint, Flood will
  //  send a cookie with token to user. Users with admin privileges may create additional
  //  users with different password and torrent client configurations.
  //
  // none:
  //  There is no per-user config and no attempt to authenticate. An auth cookie with token is
  //  still needed to access API endpoints. This allows us to utilize browser's protections
  //  against session hijacking. The cookie with token will be sent unconditionally when
  //  /authenticate or /verify endpoints are accessed. Instead of per-user config, the
  //  configUser settings will be used.
  authMethod: AuthMethod;

  // Settings for the no-user configuration.
  configUser: ClientConnectionSettings;

  // The host that Flood should listen for web connections on.
  // To listen on all interfaces, change to `floodServerHost: '0.0.0.0'`. [default: '127.0.0.1']
  floodServerHost: string;

  // The port that Flood should listen for web connections on. [default: 3000]
  floodServerPort: number;

  // Used for development only. Not used in production.
  // See the "Local Development" section of README.md for detail.
  floodServerProxy: string;

  // Flood keeps a history of torrent download and upload speeds.
  // This value dictates the number of individual records per period to keep.
  maxHistoryStates: number;

  // How often (in milliseconds) Flood will request the torrent list. This value affects how
  // often values are updated when a user is present. {torrentClientPollIntervalIdle} will be
  // used when no user is present. Note that poll intervals only affect activity stream. API
  // requests like "GET /api/torrents" always trigger fresh torrent list fetch. [default: 1000 * 2]
  torrentClientPollInterval: number;

  // How often (in milliseconds) Flood will request the torrent list when no user is present.
  // {torrentClientPollInterval} will be used when at least one user is present. This value
  // usually affects some automations such as notification of download completion. Automations
  // that rely on torrent properties may be delayed within the interval. [default: 1000 * 60 * 15]
  torrentClientPollIntervalIdle: number;

  // A unique secret for signing messages with JWT (see https://jwt.io).
  // Change this to something unique and hard to guess.
  // You can use 'uuidgen' or 'cat /proc/sys/kernel/random/uuid' or 'uuidgenerator.net'.
  // By default, this is a 72-character string randomly generated at the first launch.
  // Generated secret is stored to "<rundir>/flood.secret" with 0600 permissions.
  secret: string;

  // Configuration for SSL, if using SSL with the Flood service directly. [default: false]
  ssl: boolean;

  // Path to the SSL private key. [default: '<rundir>/key.pem']
  sslKey: string;

  // Path to the SSL fullchain certificate. [default: '<rundir>/fullchain.pem']
  sslCert: string;

  // Assign desired mounts to include. Refer to "Mounted on" column of `df -P`
  // "undefined" means all possible mounts. [default: undefined]
  watchMountPoints?: Array<string>;

  // Allowed paths for file operations. "undefined" means everything. [default: undefined]
  allowedPaths?: Array<string>;
};

export = CONFIG;
