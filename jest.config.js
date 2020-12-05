module.exports = {
  verbose: true,
  collectCoverage: true,
  coverageProvider: 'v8',
  projects: [
    '<rootDir>/server/.jest/auth.config.js',
    '<rootDir>/server/.jest/rtorrent.config.js',
    '<rootDir>/server/.jest/qbittorrent.config.js',
    '<rootDir>/server/.jest/transmission.config.js',
  ],
};
