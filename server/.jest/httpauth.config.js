module.exports = {
  displayName: 'auth',
  preset: 'ts-jest/presets/js-with-babel',
  rootDir: './../',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/routes/api/httpauth.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/.jest/httpauth.setup.js'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
