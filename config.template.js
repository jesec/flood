const CONFIG = {
  dbCleanInterval: 1000 * 60 * 60,
  dbPath: './server/db/',
  floodServerPort: 3000,
  maxHistoryStates: 30,
  pollInterval: 1000 * 5,
  secret: 'flood',
  scgi: {
    host: 'localhost',
    port: 5000,
    socket: false,
    socketPath: '/tmp/rtorrent.sock'
  }
  ssl: false,
  sslKey: '/etc/letsencrypt/live/my.awesome.domain.com/fullchain.pem',
  sslCert: '/etc/letsencrypt/live/my.awesome.domain.com/privkey.pem'
};

module.exports = CONFIG;
