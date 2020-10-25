module.exports = {
  displayName: 'qbittorrent',
  preset: 'ts-jest/presets/js-with-babel',
  rootDir: './../',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['auth.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/.jest/qbittorrent.setup.js'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
