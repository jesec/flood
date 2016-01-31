const config = {
  databasePath: './server/db/',
  maxHistoryStates: 30,
  pollInterval: 5000,
  uiDatabaseCleanInterval: 1000 * 60 * 60 // 1 hour
};

module.exports = config;
