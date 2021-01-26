const {compilerOptions} = require('../tsconfig.json');
const {pathsToModuleNameMapper} = require('ts-jest/utils');

module.exports = {
  displayName: 'qbittorrent',
  preset: 'ts-jest/presets/js-with-babel',
  rootDir: './../',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/..',
  }),
  testEnvironment: 'node',
  testPathIgnorePatterns: ['auth.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/.jest/qbittorrent.setup.js'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
