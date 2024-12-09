module.exports = {
  transformIgnorePatterns: ['node_modules/.pnpm/(?!(p-queue|p-timeout).*/)', 'node:sea'],
  transform: {
    // transform ESM only package to CommonJS
    '^.+\\.(t|j)sx?$': [
      'jest-esbuild',
      {
        format: 'cjs',
      },
    ],
  },
};
