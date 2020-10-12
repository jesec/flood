module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  roots: ['..'],
  testPathIgnorePatterns: ['auth.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/test.setup.js'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
