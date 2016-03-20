const config = {
  dbCleanInterval: 1000 * 60 * 60,
  dbPath: './server/db/',
  maxHistoryStates: 30,
  pollInterval: 1000 * 5,
  scgiHost: 'localhost',
  scgiHostPort: 5000
};

module.exports = config;
