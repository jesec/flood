module.exports = {
  displayName: 'rtorrent',
  preset: 'ts-jest/presets/js-with-babel',
  rootDir: './../',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['auth.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/.jest/rtorrent.setup.js'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
