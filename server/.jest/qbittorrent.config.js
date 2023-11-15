const {compilerOptions} = require('../tsconfig.json');
const {pathsToModuleNameMapper} = require('ts-jest');
const common = require('./common');

module.exports = {
  ...common,
  displayName: 'qbittorrent',
  preset: 'ts-jest/presets/js-with-babel',
  rootDir: './../',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/..',
  }),
  testEnvironment: 'node',
  testPathIgnorePatterns: ['auth.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/.jest/qbittorrent.setup.js'],
};
