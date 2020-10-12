module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  roots: ['..'],
  testMatch: ['<rootDir>/../routes/api/auth.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/auth.setup.js'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
