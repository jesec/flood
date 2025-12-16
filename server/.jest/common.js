module.exports = {
  transformIgnorePatterns: ['node_modules/.pnpm/(?!(p-queue|p-timeout|create-torrent).*/)'],
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
