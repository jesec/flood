module.exports = {
  displayName: 'transmission',
  preset: 'ts-jest/presets/js-with-babel',
  rootDir: './../',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['auth.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/.jest/transmission.setup.js'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
