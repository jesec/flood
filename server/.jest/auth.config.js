module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  rootDir: './../',
  testMatch: ['<rootDir>/routes/api/auth.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/.jest/auth.setup.js'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
