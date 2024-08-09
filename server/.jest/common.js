module.exports = {
  transform: {
    // transform ESM only package to CommonJS
    // need to match node_modules/.pnpm/p-queue@7.4.1/node_modules/p-queue/dist/index.js
    'node_modules/.pnpm/(p-queue|p-timeout)[^/]*/.*.(j|t)s': [
      'jest-esbuild',
      {
        format: 'cjs',
      },
    ],
  },
};
