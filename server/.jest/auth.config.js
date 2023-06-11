const {compilerOptions} = require('../tsconfig.json');
const {pathsToModuleNameMapper} = require('ts-jest');

module.exports = {
  displayName: 'auth',
  preset: 'ts-jest/presets/js-with-babel',
  rootDir: './../',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/..',
  }),
  testEnvironment: 'node',
  testMatch: ['<rootDir>/routes/api/auth.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/.jest/auth.setup.js'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      'esbuild-jest',
      {
        format: 'cjs',
      },
    ],
  },
};
