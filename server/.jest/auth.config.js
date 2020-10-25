module.exports = {
  displayName: 'auth',
  preset: 'ts-jest/presets/js-with-babel',
  rootDir: './../',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/routes/api/auth.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/.jest/auth.setup.js'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
