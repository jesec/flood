module.exports = {
  verbose: true,
  collectCoverage: true,
  coverageProvider: 'v8',
  projects: [
    '<rootDir>/server/.jest/auth.config.js',
    '<rootDir>/server/.jest/httpauth.config.js',
    '<rootDir>/server/.jest/test.config.js',
  ],
};
