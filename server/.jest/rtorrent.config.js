const {compilerOptions} = require('../tsconfig.json');
const {pathsToModuleNameMapper} = require('ts-jest');

module.exports = {
  displayName: 'rtorrent',
  preset: 'ts-jest/presets/js-with-babel',
  rootDir: './../',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/..',
  }),
  testEnvironment: 'node',
  testPathIgnorePatterns: ['auth.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/.jest/rtorrent.setup.js'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      'esbuild-jest',
      {
        format: 'cjs',
      },
    ],
  },
};
