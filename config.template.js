// This is the configuration file for Flood, a React-based frontend for the
// rtorrent BitTorrent client.
// Copy this file to ./config.js and make changes below.
// config.js must exist before running `npm run build`.

const CONFIG = {
  // This URI will prefix all of Flood's HTTP requests. You _must_ have a web
  // server, like nginx, configured to forward these requests to the Flood
  // web server.
  // For example, if you intend to serve from http://example.com/flood, set this to
  // '/flood' and configure your web server to pass _all_ requests from `/flood` to
  // the `/flood` of Flood's web server.
  // See https://github.com/Flood-UI/flood/wiki/Using-Flood-behind-a-reverse-proxy
  baseURI: '/',
  // Flood uses a local nedb database to keep track of users, torrents,
  // and activity. The database is regularly purged to remove outdated data.
  // This value dictates how old data is, in milliseconds, before being purged.
  dbCleanInterval: 1000 * 60 * 60,
  // Where to store the local nedb database.
  dbPath: './run/db/',
  // Where to store Flood's temporary files
  tempPath: './run/temp/',
  // If this is true, there will be no users and no attempt to
  // authenticate or password-protect any page. In that case,
  // instead of per-user config, the following configUser settings
  // will be used.
  disableUsersAndAuth: false,
  // Settings for the no-user configuration.
  configUser: {
    // {ClientConnectionSettings}
    client: 'rTorrent',
    type: 'socket',
    version: 1,
    socket: '/data/rtorrent.sock',
  },
  // The host that Flood should listen for web connections on.
  // If you want to connect to Flood from hosts other that the one it is running
  // on, you should change this value.
  // To listen on all interfaces, change to `floodServerHost: '0.0.0.0'`..
  floodServerHost: '127.0.0.1',
  // The port that Flood should listen for web connections on.
  floodServerPort: 3000,
  // Used for development. See the "Local Development" section of README.md
  // for detail.
  floodServerProxy: 'http://127.0.0.1:3000',
  // Flood keeps a history of torrent download and upload speeds.
  // This value dictates the number of individual records per period to keep.
  maxHistoryStates: 30,
  // How often (in milliseconds) Flood will request the torrent list from.
  torrentClientPollInterval: 1000 * 2,
  // A unique secret for signing messages with JWT (see https://jwt.io).
  // Change this to something unique and hard to guess.
  // You can use 'uuidgen' or 'cat /proc/sys/kernel/random/uuid' or 'uuidgenerator.net'.
  // eslint-disable-next-line no-undef
  secret: process.env.FLOOD_SECRET || CHANGE_ME,
  // Configuration for SSL, if using SSL with the Flood service directly.
  ssl: false,
  sslKey: '/absolute/path/to/key/',
  sslCert: '/absolute/path/to/certificate/',
  // disk space service checks disk space of mounted partitions
  diskUsageService: {
    // assign desired mounts to include. Refer to "Mounted on" column of `df -P`
    // watchMountPoints: [
    //   "/mnt/disk"
    // ]
  },
  // Allowed paths for file operations
  // allowedPaths: ['/mnt/download', '/data/download'],
};
// Do not remove the below line.
module.exports = CONFIG;
