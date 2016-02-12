const config = {
  databasePath: './server/db/',
  host: 'localhost',
  hostPort: 5000,
  maxHistoryStates: 30,
  pollInterval: 5000,
  uiDatabaseCleanInterval: 1000 * 60 * 60 // 1 hour
};

module.exports = config;
