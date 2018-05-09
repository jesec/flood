// This is the configuration file for Flood, a React-based frontend for the
// rtorrent BitTorrent client.
// Copy this file to ./config.js and make changes below.
// config.js must exist before running `npm run build`.

const CONFIG = {
  // The URL that Flood will be served from. For example, if you intend to
  // serve from http://example.com/flood, set this to '/flood'.
  // Recompiling assets with `npm run build` is needed after each `baseURI` change.
  baseURI: '/',
  // Flood uses a local nedb database to keep track of users, torrents,
  // and activity. The database is regularly purged to remove outdated data.
  // This value dictates how old data is, in milliseconds, before being purged.
  dbCleanInterval: 1000 * 60 * 60,
  // Where to store the local nedb database.
  dbPath: './server/db/',
  // The host that Flood should listen for web connections on.
  // If you want to connect to Flood from hosts other that the one it is running
  // on, you should change this value.
  // To listen on all interfaces, change to `floodServerHost: '0.0.0.0'`
  floodServerHost: '127.0.0.1',
  // The port that Flood should listen for web connections on.
  floodServerPort: 3000,
  // Used for development. See the "Local Development" section of README.md
  // for detail.
  floodServerProxy: 'http://127.0.0.1',
  // Flood keeps a history of torrent download and upload speeds.
  // This value dictates the number of individual records per period to keep.
  maxHistoryStates: 30,
  // How often (in milliseconds) Flood will check for updates to torrent detail.
  pollInterval: 1000 * 5,
  // How often (in milliseconds) Flood will check rtorrent for status updates.
  torrentClientPollInterval: 1000 * 2,
  // A unique secret for signing messages with JWT (see https://jwt.io). Change
  // this to something unique and hard to guess.
  secret: 'flood',
  // Configuration details for your backend rtorrent interface.
  // These are defaults for most installs; check your .rtorrent.rc for changes.
  scgi: {
    host: 'localhost',
    port: 5000,
    socket: false,
    socketPath: '/tmp/rtorrent.sock'
  },
  // Configuration for SSL, if using SSL with the Flood service directly.
  ssl: false,
  sslKey: '/absolute/path/to/key/',
  sslCert: '/absolute/path/to/certificate/'
};
// Do not remove the below line.
module.exports = CONFIG;
