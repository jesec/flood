const CONFIG = {
  baseURI: process.env.FLOOD_BASE_URI || '/',
  dbCleanInterval: 1000 * 60 * 60,
  dbPath: '/data/server/db/',
  floodServerPort: 3000,
  maxHistoryStates: 30,
  pollInterval: 1000 * 5,
  // eslint-disable-next-line no-undef
  secret: process.env.FLOOD_SECRET || CHANGE_ME,
  disableUsersAndAuth: process.env.FLOOD_DISABLE_AUTH === 'true' || process.env.FLOOD_DISABLE_AUTH === true,
  configUser: {
    host: process.env.RTORRENT_SCGI_HOST || 'localhost',
    port: process.env.RTORRENT_SCGI_PORT || 5000,
    socket: process.env.RTORRENT_SOCK === 'true' || process.env.RTORRENT_SOCK === true,
    socketPath: process.env.RTORRENT_SOCK_PATH || '/data/rtorrent.sock',
  },
  ssl: process.env.FLOOD_ENABLE_SSL === 'true' || process.env.FLOOD_ENABLE_SSL === true,
  sslKey: '/data/flood_ssl.key',
  sslCert: '/data/flood_ssl.cert',
};

module.exports = CONFIG;
