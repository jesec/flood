const config = {
  dbCleanInterval: 1000 * 60 * 60,
  dbPath: './server/db/',
  maxHistoryStates: 30,
  pollInterval: 1000 * 5,
  scgi: {
    host: 'localhost',
    port: 5000,
    socket: false,
    socketPath: '/tmp/rtorrent.sock'
  }
};

module.exports = config;
