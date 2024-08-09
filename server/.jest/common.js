module.exports = {
  // need to match node_modules/.pnpm/p-queue@7.4.1/node_modules/p-queue/dist/index.js
  transformIgnorePatterns: ['node_modules/.pnpm/(p-queue|p-timeout)[^/]*/.*'],
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
