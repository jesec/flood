module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  rootDir: './../',
  testPathIgnorePatterns: ['auth.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/.jest/test.setup.js'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
